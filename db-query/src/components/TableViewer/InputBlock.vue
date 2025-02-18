<template>
  <div class="input-block">
    <vxe-input 
      class="filter-input" placeholder="输入where子句"
      v-model="model.whereSql"
      @change="emit('update:whereSql', model.whereSql)"
      @keyup.enter="emit('keyupEnter')"
    >
    <template #prefix>
      <span class="input-prefix"><vxe-icon name="search"></vxe-icon> WHERE</span>
    </template>
    </vxe-input>
    <vxe-input 
      class="filter-input" 
      placeholder="输入order子句"
      v-model="model.orderSql" 
      @change="emit('update:orderSql', model.orderSql)"
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
import { reactive, watch } from 'vue';
const props = defineProps({
  whereSql: {
    type: String,
    default: ''
  },
  orderSql: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['keyupEnter', 'update:whereSql', 'update:orderSql']);

const model = reactive({
  whereSql: props.whereSql,
  orderSql: props.orderSql
});

watch(() => props.whereSql, (val) => {
  model.whereSql = val;
});

watch(() => props.orderSql, (val) => {
  model.orderSql = val;
});
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

