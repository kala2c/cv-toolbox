
/**
 * 组件公共Ref、reactive数据
 */

import { ref, computed, reactive } from 'vue';
import { _t, showLoading, hideLoading, formatDateTime } from '@/utils/common';

let props = null;

// vxe-table实例
const tableRef = ref(null);
// 高亮行索引
const highlightRowIndex = ref(-1);
// 表格数据
const tableData = ref([]);
// 表格结构
const tableStruct = ref([]);
// 表格主键
const tablePrimaryKey = computed(() => {
  return tableStruct.value.filter(o => o.key === 'PRI').map(o => o.field);
});
const tableStructMap = computed(() => {
  const result = {};
  tableStruct.value.forEach(o => {
    result[o.field] = o;
  });
});

// 删除缓存
const deleteCache = reactive({});
// 更新缓存
const updateCache = reactive({});

// 清除全部待提交的编辑
export const clearCache = () => {
  deleteCache.value = {};
  updateCache.value = {};
  tableRef.value.removeInsertRow();
}

// 表格查询参数
const actionParam = reactive({
  currentPage: 1,
  pageSize: 200,
  total: 0,
  whereSql: '',
  orderSql: '',
});
const clearActionParam = () => {
  actionParam.currentPage = 1;
  actionParam.total = 0;
  actionParam.whereSql = '';
  actionParam.orderSql = '';
}

export function useTableViewerRef() {
  return {
    highlightRowIndex,
    tableRef,
    tableData,
    tableStruct,
    tablePrimaryKey,
    tableStructMap,
    actionParam,
    deleteCache,
    updateCache,
  }
}

// 查询表格数据
async function queryTable() {
  // 查询新数据时清除缓存
  clearCache();
  // 未连接不执行查询
  if (!props.connId) return;
  showLoading();
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
  hideLoading();
}


// 表格基本信息加载
async function getTableStruct() {
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


export const useTableViewerMethods = (tableViewerProps) => {
  props = tableViewerProps;
  return {
    queryTable,
    getTableStruct,
    clearCache,
    clearActionParam,
  }
}
