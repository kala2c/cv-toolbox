<template>
  <div>
    <VxeButton>按钮</VxeButton>
    <VxeTable :data="tableData">
      <VxeColumn type="seq" width="60"></VxeColumn>
      <VxeColumn field="name" title="Name"></VxeColumn>
      <VxeColumn field="sex" title="Sex"></VxeColumn>
      <VxeColumn field="age" title="Age"></VxeColumn>
    </VxeTable>
  </div>
</template>

<script setup>
import { VxeButton } from 'vxe-pc-ui'
import { VxeTable, VxeColumn } from 'vxe-table'
import {ref} from "vue";

const tableData = ref([
  { name: 'test', sex: '1', age: 26 },
  { name: 'ss', sex: '0', age: 30 },
  { name: 'test', sex: '1', age: 26 }
]);

// const params = {
//   host: '127.0.0.1',
//   port: 3306,
//   username: 'root',
//   password: 'root',
// }
// axios.post("http://localhost:7120/createConn", params)
//     .then(res => {
//       const connId = res.data.connId;
//       axios.post("http://localhost:7120/execSql", {
//         connId: connId,
//         sql: "show databases"
//       }).then(res => {
//         console.log(res.data);
//       }).catch(err => {
//         console.log(err);
//       });
//     }).catch(err => {
//       console.log(err);
//     });
</script>