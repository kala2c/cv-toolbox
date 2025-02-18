import { reactive, nextTick } from 'vue';
import { useTableViewerRef } from './common';
import { _t, showToast } from '@/utils/common';

let props = null;

const {
  tableRef,
  highlightRowIndex,
  tableData,
  tableStruct,
  deleteCache,
  updateCache,
  tablePrimaryKey,
} = useTableViewerRef();

// ---- 表格数据操作相关 ↓↓↓↓↓

// 获取行快照
const getRowSnapshot = rowIndex => {
  const rowData = tableData.value[rowIndex];
  const map = {};
  tableStruct.value.forEach(o => {
    map[o.field] = rowData[o.field];
  });
  return map;
}

let rowCache = null;
// 单元格编辑激活
const handleEditActivated = (evt) => {
  console.log('激活编辑', evt);
  const { rowIndex, row } = evt;
  if (tableRef.value.isInsertByRow(row)) return;
  rowCache = getRowSnapshot(rowIndex);
  console.log('编辑激活，编辑行', rowIndex, '缓存', rowCache);
}
// 单元格编辑结束
const handleEditClosed = async (evt) => {
  console.log('编辑结束', evt);
  const { rowIndex, columnIndex, row } = evt;
  if (tableRef.value.isInsertByRow(row)) return;
  const rowData = getRowSnapshot(rowIndex);
  const rowStr = JSON.stringify(rowData);
  if (rowStr !== JSON.stringify(rowCache)) {
    console.log('数据有变化，准备更新');
    // 单元格缓存模式 ↓↓↓↓↓
    // 使用主键作为缓存key
    const cacheKey = tablePrimaryKey.value.map(o => rowCache[o]).join('-');
    if (deleteCache.value[cacheKey]) {
      // 待删除数据中存在 则取消删除
      delete deleteCache.value[cacheKey];
    }
    const cacheKeyNew = tablePrimaryKey.value.map(o => rowData[o]).join('-');
    const newVal = getRowSnapshot(rowIndex);
    if (updateCache.value[cacheKey]) {
      // 此处可以校验newVal是否等于olaVal，相等则从缓存中移除
      updateCache.value[cacheKey].newVal = newVal;
    } else {
      updateCache.value[cacheKey] = {
        oldVal: rowCache,
        newVal: getRowSnapshot(rowIndex)
      };
    }
    // 如果修改了主键值，则缓存key需要更新
    if (cacheKey !== cacheKeyNew) {
      updateCache.value[cacheKeyNew] = updateCache.value[cacheKey];
      delete updateCache.value[cacheKey];
    }
    // 单元格缓存模式 ↑↑↑↑↑

    // // 单元格实时保存模式 ↓↓↓↓↓
    // // 当前单元格更新的字段
    // const field = tableStruct.value[columnIndex].field;
    // // 使用主键作为条件
    // const condition = tablePrimaryKey.value.map(o => `${o} = '${rowCache[o]}'`).join(' and ');
    // const sql = `update ${_t(props.tableName)} set ${field} = '${rowData[field]}' where ${condition}`;
    // console.log('执行的sql', sql);
    // await nodeObj.db.query(props.connId, sql);
    // showToast('更新成功');
    // // 单元格实时保存模式 ↑↑↑↑↑
  }
}

// 新增行
const handleInsertClick = async () => {
  if (!props.connId) return;
  const row = await tableRef.value.insertAt({ isNew: true }, -1);
  nextTick(() => {
    tableRef.value.scrollToRow(row);
  });
}

// 删除行
const handleDeleteClick = async () => {
  if (!props.connId) return;
  if (highlightRowIndex.value > -1) {
    if (highlightRowIndex.value >= tableData.value.length) {
      // 删除的是新增行
      const insertRecords = tableRef.value.getInsertRecords();
      // 选中行都在底部 重新计算id
      const rIndex = highlightRowIndex.value - tableData.value.length;
      tableRef.value.remove(insertRecords[rIndex]);
      return;
    }
    const rowData = tableData.value[highlightRowIndex.value];
    // 使用主键作为索引
    const key = tablePrimaryKey.value.map(o => rowData[o]).join('-');
    // 如果编辑数据缓存中存在，则取消编辑状态
    if (updateCache.value[key]) {
      const oldVal = updateCache.value[key].oldVal;
      console.log('取消编辑状态', oldVal)
      // 重新设置行数据
      tableRef.value.setRow(rowData, oldVal);
      delete updateCache.value[key];
    }
    deleteCache.value[key] = rowData;
  }
}

// 提交更新到数据库
async function commitUpdate() {
  console.log('commit更新到数据库，数据集', updateCache.value)
  // 将updateCache转换为sql语句
  const updateSql = [];
  for (const key in updateCache.value) {
    const { oldVal, newVal } = updateCache.value[key];
    // 使用主键作为条件
    const condition = tablePrimaryKey.value.map(o => `${o} = '${oldVal[o]}'`).join(' and ');
    const fieldSqlStr = [];
    for (const field in newVal) {
      if (oldVal[field] === newVal[field]) {
        // 字段未更改，跳过
        continue;
      }
      fieldSqlStr.push(`${field} = '${newVal[field]}'`);
    }
    if (fieldSqlStr.length < 1) continue; // 无更新字段，跳过
    updateSql.push(`update ${_t(props.tableName)} set ${fieldSqlStr.join(',')} where ${condition};`);
  }
  console.log('commit到数据库，sql语句', updateSql)
  if (updateSql.length < 1) return;
  await nodeObj.db.query(props.connId, updateSql.join("\n"));
  updateCache.value = {};
  showToast('更新数据成功');
}

// 提交删除到数据库
async function commitDelete() {
  console.log('commit删除到数据库，数据集', deleteCache.value)
  // 将deleteCache转换为sql语句
  const deleteSql = [];
  for (const key in deleteCache.value) {
    const row = deleteCache.value[key];
    // 使用主键作为条件
    const condition = tablePrimaryKey.value.map(key => `${key} = '${row[key]}'`).join(' and ');
    deleteSql.push(`delete from ${_t(props.tableName)} where ${condition};`);
  }
  console.log('commit到数据库，sql语句', deleteSql)
  if (deleteSql.length < 1) return;
  await nodeObj.db.query(props.connId, deleteSql.join("\n"));
  deleteCache.value = {};
  showToast('删除数据成功');
}

// 提交新增到数据库
async function commitInsert() {
  const insertRecords = tableRef.value.getInsertRecords();
  const insertSql = [];
  for (const row of insertRecords) {
    let insertFields = [];
    let insertValues = [];
    for (const col of tableStruct.value) {
      const field = col.field;
      if (row[field] !== null && row[field] !== undefined) {
        insertFields.push(_t(field));
        insertValues.push(`'${row[field]}'`);
      }
    }
    if (insertFields.length > 0 && insertValues.length > 0) {
      insertSql.push(`insert into ${_t(props.tableName)} (${insertFields.join(',')}) values (${insertValues.join(',')});`);
    }
  }
  console.log('执行insert操作', insertSql)
  if (insertSql.length > 0) {
    await nodeObj.db.query(props.connId, insertSql.join("\n"));
    showToast('插入数据成功');
  }
}

// 提交修改到数据库
async function commitModify() {
  await commitUpdate();
  await commitDelete();
  await commitInsert();
}

// ---- 表格数据操作相关 ↑↑↑↑↑

export function useModify(tableViewerProps) {
  props = tableViewerProps;
  return {
    handleEditActivated,
    handleEditClosed,
    handleInsertClick,
    handleDeleteClick,
    commitModify,
  }
}
