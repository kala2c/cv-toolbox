
<template>
  <div class="table-render">
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
      @edit-activated="evt => emit('editActivated', evt)"
      @edit-closed="evt => emit('editClosed', evt)"
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
</template>

<script setup>
/**
 * vxe-table相关
 */
import { reactive } from 'vue';
import { useTableViewerRef } from './js/common';

const { 
  highlightRowIndex,
  tableRef,
  tableData,
  tableStruct,
  tablePrimaryKey,
  deleteCache,
  updateCache,
} = useTableViewerRef();

const emit = defineEmits(['editActivated', 'editClosed']);

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

// 行样式
function getRowClassName({ row, rowIndex, $rowIndex }) {
  if (highlightRowIndex.value === rowIndex) {
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

// 单元格样式
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

// 单元格点击
const handleCellClick = (evt) => {
  const { row, rowIndex, column, columnIndex } = evt;
  highlightRowIndex.value = rowIndex;
}
// 判断元素及其祖宗元素是否包含指定类名
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
  // 点击表格以外的地方取消选中状态 ↓↓↓↓↓↓
  if (!evt.target) {
    highlightRowIndex.value = -1;
  }
  if (!traceElHasClass(evt.target, 'vxe-table')) {
    setTimeout(() => {
      highlightRowIndex.value = -1;
    }, 100);
  }
  if (traceElHasClass(evt.target, 'vxe-table--header')) {
    highlightRowIndex.value = -1;
  }
  // 点击表格以外的地方取消选中状态 ↑↑↑↑↑
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
.null-value {
  color: #aaaaaa;
  font-style: italic;
}
</style>