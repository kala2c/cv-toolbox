<template>
  <div class="table-viewer" :style="{ height: props.height }">
    <!-- where子句和order子句 -->
    <input-block 
      v-model:whereSql="actionParam.whereSql"
      v-model:orderSql="actionParam.orderSql" 
      @keyupEnter="execQuery"
    ></input-block>
    <div class="scroll-container">
      <vxe-table
        ref="tableRef"
        :data="tableData"
        stripe
        border
        show-overflow
        height="100%"
        :edit-config="editConfig"
        :menu-config="menuConfig"
        :row-class-name="getRowClassName"
        :cell-class-name="getCellClassName"
        @edit-activated="handleEditActivated"
        @edit-closed="handleEditClosed"
        @menu-click="handleMenuClick"
        @cell-click="handleCellClick"
      >
        <!-- <vxe-column type="seq" width="60"></vxe-column> -->
        <template v-for="col in tableStruct" :key="col.field">
          <vxe-column
              :field="col.field"
              :title="col.title"
              :edit-render="{ enabled: true }"
          >
            <template #default="{ row, column, rowIndex, columnIndex }">
              <!-- 空值 -->
              <template v-if="row[col.field] === null || row[col.field] === undefined">
                <span class="null-value">NULL</span>
              </template>
              <!-- 日期时间 -->
              <!-- <template v-else-if="col.type === 'datetime'">-->
              <!-- {{ formatDateTime(row[col.field]) }}-->
              <!-- </template>-->
              <!-- 其他 -->
              <template v-else>
                {{ row[col.field] }}
              </template>
            </template>
            <template #edit="{ row, column, rowIndex, columnIndex }">
              <template v-if="col.type === 'datetime'">
                <vxe-date-picker v-model="row[col.field]" type="datetime"></vxe-date-picker>
              </template>
              <template v-else>
                <vxe-input v-model="row[col.field]"></vxe-input>
              </template>
            </template>
          </vxe-column>
        </template>
      </vxe-table>
    </div>
    <div class="action-block">
      <div class="left">
        <pager
          v-model="actionParam"
          @change="queryTable"
        />
      </div>
      <div class="right">
        <action-item icon="undo" @click="execQueryAndClear" title="还原到初始状态" />
        <action-item icon="refresh" @click="queryTable" title="刷新数据" />
        <action-item icon="add" @click="onInsert" title="新增行" />
        <action-item icon="minus" @click="onDelete" title="删除行" />
        <action-item icon="arrows-up" @click="onCommit" title="提交修改" />
      </div>
    </div>

    <vxe-drawer
        show-footer
        show-confirm-button
        show-cancel-button
        v-model="editPopupShow"
        title="编辑单元格内容"
        width="800"
        @show="handleEditPopupShow"
        @confirm="handleEditPopupConfirm">
      <p>编辑单元格内容</p>
      <text-editor v-model="editData.cellValue" lang="" />
    </vxe-drawer>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch} from 'vue';
import { VxeUI } from 'vxe-pc-ui';
import {_t, formatDateTime, showToast} from "@/utils/common";
import TextEditor from "@/components/TextEditor.vue";
import InputBlock from "./InputBlock.vue";
import Pager from './Pager.vue';
import ActionItem from './ActionItem.vue';

// 组件参数
const props = defineProps({
  connId: {
    type: String,
    required: true
  },
  database: {
    type: String,
    required: true
  },
  tableName: {
    type: String,
    required: true
  },
  height: {
    type: String,
    default: '500px'
  }
});

// 表格实例
const tableRef = ref();

// vxe-table相关 ↓↓↓↓↓
// 单元格编辑配置
const editConfig = {
  mode: 'cell',
  trigger: 'dblclick',
}
// 单元格右键配置
const menuConfig = reactive({
  body: {
    options: [
      [
        { code: 'editText', name: '打开编辑器' },
        { code: 'copyCell', name: '复制单元格' },
        { code: 'copyRow', name: '复制行' }
      ]
    ]
  }
});
// 右键操作回调
const handleMenuClick = (evt) => {
  const { rowIndex, columnIndex, menu } = evt;
  const rowData = getRowSnapshot(rowIndex);
  const col = tableStruct.value[columnIndex];
  const field = col.field;
  if (menu.code === 'editText') {
    if (col.type !== 'text' && col.type.indexOf('varchar') !== 0) {
      showToast('只能编辑文本类型', 'warning');
      return;
    }
    const cellValue = rowData[field];
    editData.rowIndex = rowIndex;
    editData.columnIndex = columnIndex;
    editData.cellValueRaw = cellValue;
    editData.cellValue = cellValue;
    editPopupShow.value = true;
  }
}
// vxe-table相关 ↑↑↑↑↑

// 单元格编辑器相关 ↓↓↓↓↓
const editData = reactive({
  rowIndex: -1,
  columnIndex: -1,
  cellValueRaw: '',
  cellValue: '',
});
const editPopupShow = ref(false);
const handleEditPopupShow = () => {
  console.log('打开编辑器');
}
const handleEditPopupConfirm = () => {
  console.log('保存编辑器');
}
// 单元格编辑器相关 ↑↑↑↑↑

// ---- 表格数据查询相关 ↓↓↓↓↓

// 表格基本信息
const tableData = ref([]);
const tableStruct = ref([]);
// 表格主键数组
const tablePrimaryKey = computed(() => {
  return tableStruct.value.filter(o => o.key === 'PRI').map(o => o.field);
});
// const tableStructMap = computed(() => {
//   const result = {};
//   tableStruct.value.forEach(o => {
//     result[o.field] = o;
//   });
// });

// 表格初始化
const initTable = async () => {
  console.log('初始化表格', JSON.stringify(props));
  const connInfo = await nodeObj.db.getConnInfo(props.connId);
  if (!connInfo) return;
  // 如果当前使用的数据库不是指定的数据库，先切换数据库
  if (connInfo.database !== props.database) {
    await nodeObj.db.changeDatabase(props.connId, props.database);
  }
  // 获取表结构
  await getTableStruct();
  // 执行数据查询
  await queryTable();
}
// 表格查询参数
const actionParam = reactive({
  currentPage: 1,
  pageSize: 200,
  total: 0,
  whereSql: '',
  orderSql: '',
});
// 清除查询参数
function clearActionParam() {
  actionParam.currentPage = 1;
  actionParam.whereSql = '';
  actionParam.orderSql = '';
}
// 查询表格数据
const queryTable = async () => {
  // 查询新数据时清除缓存
  clearCache();
  // 未连接不执行查询
  if (!props.connId) return;
  VxeUI.loading.open();
  let sql = `select * from ${_t(props.tableName)}`;
  let totalSql = `select count(1) as total from ${_t(props.tableName)}`;
  if (actionParam.whereSql) {
    sql += ` where ${actionParam.whereSql}`;
    totalSql += ` where ${actionParam.whereSql}`;
  }
  if (actionParam.orderSql) {
    sql += ` order by ${actionParam.orderSql}`;
  }
  // 查询数据总条数
  const totalQuery = await nodeObj.db.query(props.connId, totalSql);
  actionParam.total = totalQuery.result[0].total;
  // 组装分页参数
  const offset = (actionParam.currentPage - 1) * actionParam.pageSize;
  sql += ` limit ${actionParam.pageSize} offset ${offset};`;
  const query = await nodeObj.db.query(props.connId, sql);
  tableData.value = query.result.map(row => {
    // 数据处理
    tableStruct.value.forEach(col => {
      if (col.type === 'datetime') {
        // 日期时间类型处理
        row[col.field] = formatDateTime(row[col.field]);
      }
    });
    return row;
  });
  VxeUI.loading.close();
}
// 清除全部待提交的编辑
const clearCache = () => {
  deleteCache.value = {};
  updateCache.value = {};
  tableRef.value.removeInsertRow();
}

// 执行查询
const execQuery = () => {
  if (!props.connId) return;
  queryTable();
}

// 执行查询并清除缓存
const execQueryAndClear = () => {
  if (!props.connId) return;
  clearActionParam();
  clearCache();
  queryTable();
}

// 表格基本信息加载
const getTableStruct = async () => {
  const sql = `desc ${_t(props.tableName)};`;
  const query = await nodeObj.db.query(props.connId, sql);
  console.log('表信息', sql, query.result);
  tableStruct.value = query.result.map(o => {
    return {
      field: o.Field,
      title: o.Field,
      default: o.Default,
      extra: o.Extra,
      // 键信息  ''-普通 | PRI-主键
      key: o.Key,
      type: o.Type,
      allowNull: o.Null,
    }
  });
}

// props中tableName变化时，初始化表格
watch(() => props.tableName, () => {
  console.log('tableName变化，配置：', JSON.stringify(props));
  if (props.connId && props.database && props.tableName) {
    initTable();
  }
}, {
  immediate: true
});

// ---- 表格数据查询相关 ↑↑↑↑↑

// ---- 表格数据操作相关 ↓↓↓↓↓

// 修改的缓存
const updateCache = ref({});
// 新增数据缓存
// const insertCache = []; // 目前使用vxe内部的records管理器足够
// 删除数据缓存
const deleteCache = ref({});
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
const onInsert = () => {
  if (!props.connId) return;
  tableRef.value.insertAt({ isNew: true }, -1);
}

// 删除行
const onDelete = async () => {
  if (!props.connId) return;
  if (selectedRowIndex.value > -1) {
    if (selectedRowIndex.value >= tableData.value.length) {
      // 删除的是新增行
      const insertRecords = tableRef.value.getInsertRecords();
      // 选中行都在底部 重新计算id
      const rIndex = selectedRowIndex.value - tableData.value.length;
      tableRef.value.remove(insertRecords[rIndex]);
      return;
    }
    const rowData = tableData.value[selectedRowIndex.value];
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
const onCommit = async () => {
  if (!props.connId) return;
  await commitUpdate();
  await commitDelete();
  await commitInsert();
  await queryTable();
}

// ---- 表格数据操作相关 ↑↑↑↑↑

const selectedRowIndex = ref(-1);
const handleCellClick = (evt) => {
  const { row, rowIndex, column, columnIndex } = evt;
  selectedRowIndex.value = rowIndex;
}
function traceElHasClass(el, className) {
  while (el !== document.body) {
    if (!el) return false;
    if (el.classList && el.classList.contains(className)) {
      return true;
    }
    el = el.parentNode;
  }
  return false;
}
document.addEventListener('click', (evt) => {
  // 点击表格以外的地方取消选中状态
  if (!evt.target) {
    selectedRowIndex.value = -1;
  }
  if (!traceElHasClass(evt.target, 'vxe-table')) {
    setTimeout(() => {
      selectedRowIndex.value = -1;
    }, 100);
  }
  if (traceElHasClass(evt.target, 'vxe-table--header')) {
    selectedRowIndex.value = -1;
  }
});

function getRowClassName({ row, rowIndex, $rowIndex }) {
  if (selectedRowIndex.value === rowIndex) {
    // 选中行 蓝色
    return 'bg-blue-light';
  }
  const cacheKey = tablePrimaryKey.value.map(o => row[o]).join('-');
  if (deleteCache.value[cacheKey]) {
    // 删除行 灰色
    return 'bg-gray';
  }
  if (tableRef.value.isInsertByRow(row)) {
    // 新增行 绿色
    return 'bg-green';
  }
}

function getCellClassName({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex }) {
  const cacheKey = tablePrimaryKey.value.map(o => row[o]).join('-');
  if (updateCache.value[cacheKey]) {
    const cache = updateCache.value[cacheKey];
    if (cache.oldVal[column.field] !== cache.newVal[column.field]) {
      // 待修改的格子 深蓝色
      return 'bg-blue';
    }
  }
}

// 清除组件全部数据
function clearAll() {
  tableData.value = [];
  tableStruct.value = [];
  selectedRowIndex.value = -1;
  clearActionParam();
  clearCache();
}

/**
 * 暴露方法
 */
defineExpose({
  initTable,
  clearAll,
});
</script>

<style lang="scss">
.bg-green {
  background-color: #dff0d8!important;
}
.bg-blue-light {
  background-color: #d9edf7!important;
}
.bg-gray {
  background-color: #dedede!important;
}
.bg-blue {
  background-color: #90c2db!important;
}
.action-block {
  margin-top: 5px;
  display: flex;
  justify-content: space-between;
  .left, .right {
    display: flex;
    align-items: center;
  }
}

.null-value {
  color: #aaaaaa;
  font-style: italic;
}
.table-viewer {  
  .input-block {
    height: 34px;
  }
  
  .scroll-container {
    height: calc(100% - 75px);
  }
  
  .action-block {
    height: 34px;
  }
}
</style>
