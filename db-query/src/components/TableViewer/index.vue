<template>
  <div class="table-viewer" :style="{ height: props.height }">
    <!-- where子句和order子句 -->
    <input-block class="input-block" @keyupEnter="handleInputKeyupEnter"></input-block>
    <!-- 表格渲染 -->
    <table-block
      class="table-render"
      @edit-activated="handleEditActivated"
      @edit-closed="handleEditClosed"
    />
    <!-- 底部操作区 -->
    <div class="action-block">
      <!-- 分页区 -->
      <div class="left">
        <pager-block @change="queryTable" />
      </div>
      <!-- 操作区 -->
      <div class="right">
        <action-item icon="refresh" @click="handleResetClick" title="还原到初始状态" />
        <action-item icon="arrows-down" @click="handleRefreshClick" title="刷新数据" />
        <action-item icon="add" @click="handleInsertClick" title="新增行" />
        <action-item icon="minus" @click="handleDeleteClick" title="删除行" />
        <action-item icon="arrows-up" @click="handleCommitClick" title="提交修改" />
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
import { _t, formatDateTime, showToast } from "@/utils/common";
import TextEditor from "@/components/TextEditor.vue";
import { useTableViewerRef, useTableViewerMethods } from './js/common';
import { useModify } from './js/modify';
import InputBlock from "./InputBlock.vue";
import PagerBlock from './PagerBlock.vue';
import ActionItem from './components/ActionItem.vue';
import TableBlock from './TableBlock.vue';

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

// 基础表格数据
const { 
  tableData,
  tableStruct,
} = useTableViewerRef();

// 表格基础方法
const {
  queryTable,
  getTableStruct,
  clearCache,
  clearActionParam,
} = useTableViewerMethods(props);

// where子句和order子句输入框回车事件
const handleInputKeyupEnter = () => {
  if (!props.connId) return;
  queryTable();
}

// 右下角编辑区事件 ↓↓↓↓↓
const {
  handleEditActivated,
  handleEditClosed,
  handleInsertClick,
  handleDeleteClick,
  commitModify,
} = useModify(props);
const handleResetClick = () => {
  clearActionParam();
  clearCache();
  queryTable();
}
const handleRefreshClick = () => {
  queryTable();
}
const handleCommitClick = async   () => {
  if (!props.connId) return;
  await commitModify();
  await queryTable();
}
// 右下角编辑区事件 ↑↑↑↑↑

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
// props中tableName变化时，初始化表格
watch(() => props.tableName, () => {
  console.log('tableName变化，配置：', JSON.stringify(props));
  if (props.connId && props.database && props.tableName) {
    initTable();
  }
}, {
  immediate: true
});
// 清除组件全部数据
function clearAll() {
  tableData.value = [];
  tableStruct.value = [];
  highlightRowIndex.value = -1;
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
.table-viewer {  
  .input-block {
    height: 34px;
  }
  
  .table-render {
    height: calc(100% - 75px);
  }
  
  .action-block {
    height: 34px;
    margin-top: 5px;
    display: flex;
    justify-content: space-between;
    .left, .right {
      display: flex;
      align-items: center;
    }
  }
}
</style>
