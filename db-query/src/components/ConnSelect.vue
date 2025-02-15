<template>
  <div class="conn-select">
    <vxe-select v-model="currentTestConfig" @change="handleConfigListChange">
      <vxe-option
          v-for="config in testConfigList"
          :key="config.name"
          :label="config.name"
          :value="config.name"
      ></vxe-option>
    </vxe-select>
    <div class="params-block">
      <vxe-input v-model="config.host"></vxe-input>
      <vxe-input v-model="config.port"></vxe-input>
      <vxe-input v-model="config.username"></vxe-input>
      <vxe-input v-model="config.password"></vxe-input>
      <vxe-button @click="createDbConn">连接</vxe-button>
    </div>
    <div class="select-block">
      选择数据库
      <vxe-select v-model="config.currentDatabase" :data="databaseList" @change="changeDb">
        <vxe-option v-for="item in databaseList" :key="item.value" :label="item.label" :value="item.value"></vxe-option>
      </vxe-select>
      <template v-if="showTable">
        选择表
        <vxe-select v-model="config.currentTable" :data="tableList" @change="changeTable">
          <vxe-option v-for="item in tableList" :key="item.value" :label="item.label" :value="item.value"></vxe-option>
        </vxe-select>
      </template>
    </div>
  </div>
</template>

<script setup>
import { VxeUI } from 'vxe-pc-ui';
import { reactive, ref, watch } from "vue";
import { _t } from "@/utils/common";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => {
      return {
        connId: '',
        database: '',
        tableName: '',
      }
    }
  },
  showTable: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const config = reactive({
  name: '',
  host: '121.196.198.72',
  port: '7002',
  username: 'hello-world',
  password: 'mx42LjBaBTkCBpT3',

  currentDatabase: '',
  currentTable: '',
});
const connId = ref('');

const databaseList = ref([]);
const tableList = ref([]);

const localConfig = localStorage.getItem('config-cache');
if (localConfig) {
  config.value = JSON.parse(localConfig);
}
// config变化时，将数据存储到localStorage
watch(() => config.value, (newVal) => {
  localStorage.setItem('config-cache', JSON.stringify(newVal));
}, { deep: true });

async function createDbConn() {
  databaseList.value = [];
  tableList.value = [];
  connId.value = await nodeObj.db.createConnection({
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password
  })
  const res = await nodeObj.db.execSql(connId.value, 'show databases');
  const databases = res.result;
  databases.forEach(o => {
    const dbName = o.Database;
    databaseList.value.push({
      value: dbName,
      label: dbName,
    });
  });
  config.currentDatabase = databaseList.value[0].value;
  await changeDb();
}

const changeDb = async () => {
  console.log('切换数据库', config.currentDatabase);
  config.currentTable = '';
  // 切换到数据库
  // await nodeObj.db.changeDatabase(connId.value, config.currentDatabase);
  const res = await nodeObj.db.execSql(connId.value, `show tables from ${_t(config.currentDatabase)}`);
  const tables = res.result;
  tableList.value = tables.map(o => {
    const tableName = o[`Tables_in_${config.currentDatabase}`];
    return {
      value: tableName,
      label: tableName,
    };
  });
  config.currentTable = tableList.value[0].value;
  emit('update:modelValue', {
    connId: connId.value,
    database: config.currentDatabase,
    tableName: config.currentTable
  });
  changeTable();
}
const changeTable = () => {
  console.log('切换表', config.currentTable);
  const data = {
    connId: connId.value,
    database: config.currentDatabase,
    table: config.currentTable
  };
  emit('change', data);
  emit('update:modelValue', data);
}


// 测试用的链接
const currentTestConfig = ref('');
const testConfigList = ref([
  { name: '1.26-helloworld', host: '121.196.198.72', port: '7002', username: 'hello-world', password: 'mx42LjBaBTkCBpT3' },
  { name: '数图mysql', host: '192.168.3.240', port: '3306', username: 'root', password: 'root' },
]);
const handleConfigListChange = () => {
  const testConfig = testConfigList.value.find(o => o.name === currentTestConfig.value);
  config.host = testConfig.host;
  config.port = testConfig.port;
  config.username = testConfig.username;
  config.password = testConfig.password;
  createDbConn();
}
currentTestConfig.value = testConfigList.value[0].name;
handleConfigListChange();
</script>

<style lang="scss">

</style>
