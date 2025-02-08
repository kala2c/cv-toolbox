<template>
  <div>
    <vxe-button @click="openConfigModal">新建链接</vxe-button>

    <div class="list-group">
      <p>链接列表</p>
      <div class="list-item" v-for="config in configList" :key="config.name">
        <span>{{config.name}}</span>
        <vxe-button @click="createDbConn(config)">连接</vxe-button>
      </div>
    </div>

    <div>
      <div v-for="db in databaseList" :key="db.dbname">
        <p @dblclick="expandDatabase(db)">{{ db.dbname }}</p>
        <div v-for="table in db.tableList" :key="table.name">
          <p @dblclick="expandTable(db.dbanme, table)">{{ table.name }}</p>
        </div>
      </div>
    </div>

    <vxe-table :data="tableData">

    </vxe-table>

    <vxe-modal v-model="configModalShow">
      <vxe-form
          ref="formRef"
          :data="configForm"
          @submit="onSubmit"
          @reset="onReset">
        <vxe-form-item title="链接名称" field="name" span="24" :item-render="{}">
          <template #default="params">
            <vxe-input v-model="configForm.name"></vxe-input>
          </template>
        </vxe-form-item>
        <vxe-form-item title="链接地址" field="host" span="18" :item-render="{}">
          <template #default="params">
            <vxe-input v-model="configForm.host"></vxe-input>
          </template>
        </vxe-form-item>
        <vxe-form-item title="端口" field="port" span="6" :item-render="{}">
          <template #default="params">
            <vxe-input v-model="configForm.port"></vxe-input>
          </template>
        </vxe-form-item>
        <vxe-form-item title="用户名" field="username" span="24" :item-render="{}">
          <template #default="params">
            <vxe-input v-model="configForm.username"></vxe-input>
          </template>
        </vxe-form-item>
        <vxe-form-item title="密码" field="password" span="24" :item-render="{}">
          <template #default="params">
            <vxe-input v-model="configForm.password"></vxe-input>
          </template>
        </vxe-form-item>
        <vxe-form-item align="center" span="24" :item-render="{}">
          <template #default>
            <vxe-button type="submit" status="primary" content="确定"></vxe-button>
            <vxe-button type="reset" content="重置"></vxe-button>
          </template>
        </vxe-form-item>
      </vxe-form>
    </vxe-modal>
  </div>
</template>

<script setup>
import {VxeButton, VxeModal, VxeForm, VxeFormItem, VxeInput} from 'vxe-pc-ui'
import {VxeTable, VxeColumn} from 'vxe-table'
import {reactive, ref, watch} from "vue";

const configModalShow = ref(false);
const openConfigModal = () => {
  configModalShow.value = true;
}

const configForm = reactive({
  name: '',
  host: '',
  port: '',
  username: '',
  password: '',
});

const configList = ref([]);

const localConfigList = localStorage.getItem('configList');
if (localConfigList) {
  configList.value = JSON.parse(localConfigList);
}
// configList变化时，将数据存储到localStorage
watch(() => configList.value, (newVal) => {
  localStorage.setItem('configList', JSON.stringify(newVal));
}, { deep: true });

const onSubmit = () => {
  configModalShow.value = false;
  const nameList = configList.value.map(conn => conn.name);
  if (nameList.includes(configForm.name)) {
    console.log('链接名称重复，无法添加');
    return;
  }
  if (!configForm.name) {
    configForm.name = `${configForm.username}@${configForm.host}:${configForm.port}`;
  }
  configList.value.push(configForm);
}

let connId = null;

const databaseList = ref([]);

const createDbConn = async (config) => {
  connId = await nodeObj.db.createConnection({
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password
  })
  const res = await nodeObj.db.execSql(connId, 'show databases');
  const databases = res.result;
  databases.forEach(o => {
    databaseList.value.push({
      dbname: o.Database,
      tableList: [],
    });
  })
}

const _t = str => "`" + str + "`";

const expandDatabase = async (db) => {
  if (db.tableList.length > 0) return;
  const res = await nodeObj.db.execSql(connId, `show tables from ${_t(db.dbname)}`);
  const tables = res.result;
  db.tableList = tables.map(o => ({name: o[`Tables_in_${db.dbname}`]}));
}

const tableStruct = ref([]);
const tableData = ref([]);

const expandTable = async (database, table) => {
  const sql = `select * from ${_t(database)}.${_t(table.name)} limit 500`;
  const res = await nodeObj.db.execSql(connId, sql);
  console.log('表格数据', res);
  tableData.value = res.result;
}

const onReset = () => {
  console.log('reset');
}

</script>