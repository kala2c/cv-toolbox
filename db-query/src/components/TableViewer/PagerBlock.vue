<template>
  <div class="pager">
    <div class="action-item" @click="goFirstPage" :class="{ disabled: isFirstPage }">
      <vxe-icon name="home-page"></vxe-icon>
    </div>
    <div class="action-item" @click="goPrevPage" :class="{ disabled: isFirstPage }">
      <vxe-icon name="arrow-left"></vxe-icon>
    </div>
    <edit-area-div 
      class="action-input" 
      v-model="actionParam.currentPage"
      @change="handlePageInputChange">
    </edit-area-div>
    <div class="action-item" @click="goNextPage" :class="{ disabled: isLastPage }">
      <vxe-icon name="arrow-right"></vxe-icon>
    </div>
    <div class="action-item" @click="goLastPage" :class="{ disabled: isLastPage }">
      <vxe-icon name="end-page"></vxe-icon>
    </div>
    <vxe-select class="action-select" v-model="actionParam.pageSize" @change="handlePageSizeChange">
      <vxe-option v-for="size in pageSizes" :key="size" :value="size" :label="size"></vxe-option>
    </vxe-select>
    <div class="action-total">
      总数 {{ actionParam.total }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import EditAreaDiv from "@/components/EditAreaDiv.vue";

import { useTableViewerRef } from './js/common';

const {
  actionParam
} = useTableViewerRef();

const pageSizes = ref([10, 100, 200, 500, 1000]);

const emit = defineEmits(['change']);

const isFirstPage = computed(() => actionParam.currentPage === 1);
const isLastPage = computed(() => {
  const maxPage = Math.ceil(actionParam.total / actionParam.pageSize);
  return actionParam.currentPage >= maxPage;
});

const goFirstPage = () => {
  if (!isFirstPage.value) {
    actionParam.currentPage = 1;
    emit('change');
  }
};

const goPrevPage = () => {
  if (actionParam.currentPage > 1) {
    actionParam.currentPage = actionParam.currentPage - 1;
    emit('change');
  }
};

const goNextPage = () => {
  const maxPage = Math.ceil(actionParam.total / actionParam.pageSize);
  if (actionParam.currentPage < maxPage) {
    actionParam.currentPage = actionParam.currentPage + 1;
    emit('change');
  }
};

const goLastPage = () => {
  const maxPage = Math.ceil(actionParam.total / actionParam.pageSize);
  if (actionParam.currentPage !== maxPage) {
    actionParam.currentPage = maxPage;
    emit('change');
  }
};

const handlePageInputChange = ({ value }) => {
  const maxPage = Math.ceil(actionParam.total / actionParam.pageSize);
  const newPage = parseInt(value);
  let page;
  if (isNaN(newPage) || newPage < 1) {
    page = 1;
  } else if (newPage > maxPage) {
    page = maxPage;
  } else {
    page = newPage;
  }
  actionParam.currentPage = page;
  emit('change');
};

const handlePageSizeChange = ({ value }) => {
  actionParam.currentPage = 1;
  actionParam.pageSize = value;
  emit('change');
};
</script>

<style lang="scss" scoped>
.pager {
  display: flex;
  align-items: center;
  
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
    &.disabled {
      color: #c0c4cc;
      cursor: not-allowed;
      &:hover {
        background-color: transparent;
      }
    }
  }
  
  .action-select {
    width: 80px;
    margin-left: 5px;
  }
  
  .action-total {
    height: 34px;
    display: flex;
    align-items: center;
    margin-left: 5px;
    margin-right: 10px;
  }
}
</style> 