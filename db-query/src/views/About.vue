<template>
  <div class="about">
    <VxeTable
      border
      show-overflow
      :data="tableData"
      :edit-config="{
        trigger: 'click',
        mode: 'cell',
        showStatus: true,
      }"
    >
      <VxeColumn
        field="id"
        title="ID"
        width="100"
      />
      <VxeColumn
        field="name"
        title="Name"
      />
      <VxeColumn
        field="age"
        title="Age"
      />
    </VxeTable>
  </div>
</template>

<script setup>
import { VxeTable, VxeColumn } from "vxe-table";
import { VxeTooltip } from "vxe-pc-ui";

const tableData = [
  { id: 10001, name: 'Test1', age: 18 },
  { id: 10002, name: 'Test2', age: 19 },
  { id: 10003, name: 'Test3', age: 20 },
  { id: 10004, name: 'Test4', age: 21 },
  { id: 10005, name: 'Test5', age: 22 },
  { id: 10006, name: 'Test6', age: 23 },
]
</script>

<style>
</style>
