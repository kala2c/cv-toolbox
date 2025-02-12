<template>
  <div class="table-viewer">
    <vxe-button @click="onTest">测试按钮</vxe-button>
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
      <vxe-column
          v-for="item in tableStruct"
          :key="item.field"
          :field="item.field"
          :title="item.title"
          :edit-render="{ name: 'input' }"
      ></vxe-column>
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
      <text-editor v-model="editData.cellValue" />
    </vxe-drawer>
  </div>
</template>

<script setup>
import {computed, reactive, ref, watch} from 'vue';
import { VxeUI } from 'vxe-pc-ui';
import { _t, showToast } from "@/utils/common";
import TextEditor from "@/components/TextEditor.vue";

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
  const field = tableStruct.value[columnIndex].field;
  if (menu.code === 'editText') {
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

  // 默认查询前500条数据
  const sql = `select * from ${_t(props.tableName)} limit 500`;
  const query = await nodeObj.db.execSql(props.connId, sql);
  tableData.value = query.result;
}

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

<style lang="scss"></style>
