<template>
  <div>
    <div class="params-block">
      <vxe-input v-model="config.host"></vxe-input>
      <vxe-input v-model="config.port"></vxe-input>
      <vxe-input v-model="config.username"></vxe-input>
      <vxe-input v-model="config.password"></vxe-input>
      <vxe-button @click="createDbConn">连接</vxe-button>
      <br>
      选择数据库
      <vxe-select v-model="config.currentDatabase" :data="databaseList" @change="changeDb">
        <vxe-option v-for="item in databaseList" :key="item.value" :label="item.label" :value="item.value"></vxe-option>
      </vxe-select>
      选择表
      <vxe-select v-model="config.currentTable" :data="tableList" @change="changeTable">
        <vxe-option v-for="item in tableList" :key="item.value" :label="item.label" :value="item.value"></vxe-option>
      </vxe-select>
    </div>
  </div>
</template>

<script setup>
import { VxeInput, VxeButton, VxeSelect, VxeOption } from 'vxe-pc-ui';
import { reactive, ref, watch } from "vue";
import {changeDatabase} from "../../node/src/db";

const _t = str => "`" + str + "`";

const config = reactive({
  name: '',
  host: '121.196.198.72',
  port: '7002',
  username: 'hello-world',
  password: 'mx42LjBaBTkCBpT3',

  currentDatabase: '',
  currentTable: '',
});

const databaseList = ref([]);
const tableList = ref([]);

let connId = '';

const localConfig = localStorage.getItem('config-cache');
if (localConfig) {
  config.value = JSON.parse(localConfig);
}
// config变化时，将数据存储到localStorage
watch(() => config.value, (newVal) => {
  localStorage.setItem('config-cache', JSON.stringify(newVal));
}, { deep: true });

const createDbConn = async () => {
  connId = await nodeObj.db.createConnection({
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password
  })
  const res = await nodeObj.db.execSql(connId, 'show databases');
  const databases = res.result;
  databases.forEach(o => {
    const dbName = o.Database;
    databaseList.value.push({
      value: dbName,
      label: dbName,
    });
  });
  config.currentDatabase = databaseList.value[0].value;
  changeDb();
}

const changeDb = async () => {
  console.log('选择数据库', config.currentDatabase);
  // 切换到数据库
  // await nodeObj.db.changeDatabase(connId, config.currentDatabase);
  const res = await nodeObj.db.execSql(connId, `show tables from ${_t(config.currentDatabase)}`);
  const tables = res.result;
  tableList.value = tables.map(o => {
    const tableName = o[`Tables_in_${config.currentDatabase}`];
    return {
      value: tableName,
      label: tableName,
    };
  });
  config.currentTable = '';
  // config.currentTable = tableList.value[0].name;
  // changeTable();
}

const changeTable = async () => {
  console.log('选择表', config.currentTable);
  const sql = `select * from ${_t(config.currentTable)} limit 500`;
  const res = await nodeObj.db.execSql(connId, sql);
  console.log('表格数据', res);
}

</script>

<style lang="scss">

</style>
