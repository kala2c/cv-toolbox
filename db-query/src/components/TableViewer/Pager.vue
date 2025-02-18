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
      v-model="currentPage"
      @change="handlePageInputChange">
    </edit-area-div>
    <div class="action-item" @click="goNextPage" :class="{ disabled: isLastPage }">
      <vxe-icon name="arrow-right"></vxe-icon>
    </div>
    <div class="action-item" @click="goLastPage" :class="{ disabled: isLastPage }">
      <vxe-icon name="end-page"></vxe-icon>
    </div>
    <vxe-select class="action-select" v-model="pageSize" @change="handlePageSizeChange">
      <vxe-option v-for="size in pageSizes" :key="size" :value="size" :label="size"></vxe-option>
    </vxe-select>
    <div class="action-total">
      总数 {{ total }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import EditAreaDiv from "@/components/EditAreaDiv.vue";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  pageSizes: {
    type: Array,
    default: () => [100, 200, 500, 1000]
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const currentPage = computed({
  get: () => props.modelValue.currentPage,
  set: (val) => updateValue('currentPage', val)
});

const pageSize = computed({
  get: () => props.modelValue.pageSize,
  set: (val) => updateValue('pageSize', val)
});

const total = computed(() => props.modelValue.total);

const updateValue = (key, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  });
};

const isFirstPage = computed(() => currentPage.value === 1);
const isLastPage = computed(() => {
  const maxPage = Math.ceil(total.value / pageSize.value);
  return currentPage.value >= maxPage;
});

const goFirstPage = () => {
  if (!isFirstPage.value) {
    updateValue('currentPage', 1);
    emit('change');
  }
};

const goPrevPage = () => {
  if (currentPage.value > 1) {
    updateValue('currentPage', currentPage.value - 1);
    emit('change');
  }
};

const goNextPage = () => {
  const maxPage = Math.ceil(total.value / pageSize.value);
  if (currentPage.value < maxPage) {
    updateValue('currentPage', currentPage.value + 1);
    emit('change');
  }
};

const goLastPage = () => {
  const maxPage = Math.ceil(total.value / pageSize.value);
  if (currentPage.value !== maxPage) {
    updateValue('currentPage', maxPage);
    emit('change');
  }
};

const handlePageInputChange = ({ value }) => {
  const maxPage = Math.ceil(total.value / pageSize.value);
  const newPage = parseInt(value);
  let page;
  if (isNaN(newPage) || newPage < 1) {
    page = 1;
  } else if (newPage > maxPage) {
    page = maxPage;
  } else {
    page = newPage;
  }
  updateValue('currentPage', page);
  emit('change');
};

const handlePageSizeChange = ({ value }) => {
  updateValue('currentPage', 1);
  updateValue('pageSize', value);
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