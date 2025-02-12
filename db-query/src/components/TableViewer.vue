<template>
  <div class="table-viewer">
    <vxe-button @click="onTest">测试按钮</vxe-button>
    <div class="action-block">
      <div class="action-item">
        <vxe-icon name="home-page"></vxe-icon>
      </div>
      <div class="action-item">
        <vxe-icon name="arrow-left"></vxe-icon>
      </div>
<!--      <vxe-input class="action-input" v-model="actionParam.currentPage"></vxe-input>-->
      <edit-area-div class="action-input" v-model="actionParam.currentPage"></edit-area-div>
      <div class="action-item">
        <vxe-icon name="arrow-right"></vxe-icon>
      </div>
      <div class="action-item">
        <vxe-icon name="end-page"></vxe-icon>
      </div>
      <vxe-select class="action-select" v-model="actionParam.pageSize">
        <vxe-option v-for="size in [100, 200, 500, 1000]" :key="size" :value="size" :label="size"></vxe-option>
      </vxe-select>
      <div class="action-total">
        总数 {{ actionParam.total }}
      </div>
      <div class="action-item">
        <vxe-icon name="refresh"></vxe-icon>
      </div>
      <div class="action-item">
        <vxe-icon name="add"></vxe-icon>
      </div>
      <div class="action-item">
        <vxe-icon name="minus"></vxe-icon>
      </div>
      <div class="action-item">
        <vxe-icon name="undo"></vxe-icon>
      </div>
      <div class="action-item">
        <vxe-icon name="arrows-up"></vxe-icon>
      </div>
    </div>
    <div class="input-block">
      <vxe-input class="filter-input" v-model="actionParam.whereSql" placeholder="输入where子句">
        <template #prefix>
          <span class="input-prefix"><vxe-icon name="search"></vxe-icon> WHERE</span>
        </template>
      </vxe-input>
      <vxe-input class="filter-input" v-model="actionParam.orderSql" placeholder="输入order子句">
        <template #prefix>
          <span class="input-prefix"><vxe-icon name="sort"></vxe-icon> ORDER BY</span>
        </template>
      </vxe-input>
      <vxe-button class="filter-btn">查询</vxe-button>
    </div>
    <vxe-table
        :data="tableData"
        stripe
        border
        show-overflow
        :edit-config="editConfig"
        :menu-config="menuConfig"
        @edit-activated="handleEditActivated"
        @edit-closed="handleEditClosed"
        @menu-click="handleMenuClick"
    >
      <template v-for="col in tableStruct" :key="col.field">
        <vxe-column
            :field="col.field"
            :title="col.title"
            :edit-render="{ enabled: true }"
        >
          <template #default="{ row, column, rowIndex, columnIndex }">
            <template v-if="row[col.field] === null || row[col.field] === undefined">
              <span class="null-value">NULL</span>
            </template>
<!--            <template v-else-if="col.type === 'datetime'">-->
<!--              {{ formatDateTime(row[col.field]) }}-->
<!--            </template>-->
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
import { computed, reactive, ref, watch } from 'vue';
import { VxeUI } from 'vxe-pc-ui';
import { _t, showToast, formatDateTime } from "@/utils/common";
import TextEditor from "@/components/TextEditor.vue";
import EditAreaDiv from "@/components/EditAreaDiv.vue";

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
  }
});

const onTest = () => {
  console.log(VxeUI);
}
// 抽屉式编辑器
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

// 单元格编辑
const editConfig = {
  mode: 'cell',
  trigger: 'dblclick',
}
// 单元格右键操作
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
const handleMenuClick = (evt) => {
  const { rowIndex, columnIndex, menu } = evt;
  const rowData = getRowSnapshot(rowIndex);
  const col = tableStruct.value[columnIndex];
  const field = col.field;
  if (menu.code === 'editText') {
    console.log(col);
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

// 表格基本信息
const tableData = ref([]);
const tableStruct = ref([]);
const tablePrimaryKey = computed(() => {
  return tableStruct.value.filter(o => o.key === 'PRI').map(o => o.field);
});
const tableStructMap = computed(() => {
  const result = {};
  tableStruct.value.forEach(o => {
    result[o.field] = o;
  });
});
/**
 * 表格初始化
 */
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

const actionParam = reactive({
  currentPage: 1,
  pageSize: 200,
  total: 0,
  whereSql: '',
  orderSql: '',
});
const queryTable = async () => {
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
  const totalQuery = await nodeObj.db.execSql(props.connId, totalSql);
  actionParam.total = totalQuery.result[0].total;
  // 组装分页参数
  const offset = (actionParam.currentPage - 1) * actionParam.pageSize;
  sql += ` limit ${actionParam.pageSize} offset ${offset}`;
  const query = await nodeObj.db.execSql(props.connId, sql);
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
}

// 表格基本信息加载
const getTableStruct = async () => {
  const sql = `desc ${_t(props.tableName)}`;
  const query = await nodeObj.db.execSql(props.connId, sql);
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


// 单元格编辑
let rowCache = null;
const getRowSnapshot = rowIndex => {
  const rowData = tableData.value[rowIndex];
  const map = {};
  tableStruct.value.forEach(o => {
    map[o.field] = rowData[o.field];
  });
  return map;
}

const handleEditActivated = (evt) => {
  const { rowIndex } = evt;
  const rowData = getRowSnapshot(rowIndex);
  rowCache = JSON.stringify(rowData);
  console.log('编辑激活，编辑行', rowIndex, '缓存', rowCache);
}

const handleEditClosed = async (evt) => {
  console.log('编辑结束', evt);
  const { rowIndex, columnIndex } = evt;
  const rowData = getRowSnapshot(rowIndex);
  const rowStr = JSON.stringify(rowData);
  if (rowStr !== rowCache) {
    console.log('数据有变化，执行更新');
    // 获取更新的字段
    const field = tableStruct.value[columnIndex].field;
    // 使用主键作为条件
    const condition = tablePrimaryKey.value.map(o => `${o} = '${rowData[o]}'`).join(' and ');
    const sql = `update ${_t(props.tableName)} set ${field} = '${rowData[field]}' where ${condition}`;
    console.log('执行的sql', sql);
    await nodeObj.db.execSql(props.connId, sql);
    showToast('更新成功');
  }
}

/**
 * 暴露方法
 */
defineExpose({
  initTable,
});
</script>

<style lang="scss">
.action-block {
  display: flex;
  margin-bottom: 5px;
  .action-item {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 34px;
    font-size: 18px;
    cursor: pointer;
    &:hover {
      background-color: #f5f5f5;
    }
  }
  .action-total {
    height: 34px;
    display: flex;
    align-items: center;
    margin-left: 5px;
    margin-right: 10px;
  }
  //.action-input {
  //  width: 30px;
  //}
  .action-select {
    width: 80px;
  }
}
.input-block {
  display: flex;
  .input-prefix {
    color: #666666;
  }
  .filter-input {
    flex: 1;
  }
  .filter-btn {
    margin-left: 0!important;
  }
}
.null-value {
  color: #aaaaaa;
  font-style: italic;
}
</style>
