<template>
  <div class="input-block">
    <vxe-input 
      class="filter-input" placeholder="输入where子句"
      v-model="actionParam.whereSql"
      @change="emit('update:whereSql', actionParam.whereSql)"
      @keyup.enter="emit('keyupEnter')"
    >
    <template #prefix>
      <span class="input-prefix"><vxe-icon name="search"></vxe-icon> WHERE</span>
    </template>
    </vxe-input>
    <vxe-input 
      class="filter-input" 
      placeholder="输入order子句"
      v-model="actionParam.orderSql" 
      @change="emit('update:orderSql', actionParam.orderSql)"
      @keyup.enter="emit('keyupEnter')"
    >
    <template #prefix>
      <span class="input-prefix"><vxe-icon name="sort"></vxe-icon> ORDER BY</span>
    </template>
    </vxe-input>
    <!-- <vxe-button class="filter-btn" @click="execQuery">查询</vxe-button> -->
  </div>
</template>

<script setup>
import { useTableViewerRef } from './js/common';

const {
  actionParam
} = useTableViewerRef();

const emit = defineEmits(['keyupEnter']);

</script>

<style lang="scss" scoped>
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
</style>

