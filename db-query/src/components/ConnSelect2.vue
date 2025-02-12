<template>
  <div class="conn-select2">
    <vxe-button @click="openConfigModal">新建链接</vxe-button>
    <div class="list-group">
      <p>链接列表</p>
      <div class="list-item" v-for="(config, index) in configList" :key="config.name">
        <span>{{config.name}}</span>
        <vxe-button @click="deleteConn(index)">删除</vxe-button>
        <vxe-button @click="createDbConn(config)">连接</vxe-button>
      </div>
    </div>

    <div>
      <div v-for="db in databaseList" :key="db.dbname">
        <p @dblclick="expandDatabase(db)">{{ db.dbname }}</p>
        <div style="padding-left: 15px" v-for="table in db.tableList" :key="table.name">
          <p @dblclick="openTable(db.dbname, table.name)">{{ table.name }}</p>
        </div>
      </div>
    </div>

    <vxe-modal title="链接信息" v-model="configModalShow">
      <vxe-form
          ref="formRef"
          :data="configForm"
          @submit="onSubmit"
          @reset="onReset"
          title-width="45"
      >
        <vxe-form-item title="名称" field="name" span="24" :item-render="{}">
          <template #default="params">
            <vxe-input v-model="configForm.name"></vxe-input>
          </template>
        </vxe-form-item>
        <vxe-form-item title="主机" field="host" span="14" :item-render="{}">
          <template #default="params">
            <vxe-input v-model="configForm.host"></vxe-input>
          </template>
        </vxe-form-item>
        <vxe-form-item title="端口" field="port" span="10" :item-render="{}">
          <template #default="params">
            <vxe-input v-model="configForm.port"></vxe-input>
          </template>
        </vxe-form-item>
        <vxe-form-item title="用户" field="username" span="24" :item-render="{}">
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
import { VxeUI } from 'vxe-pc-ui';
import { reactive, ref, watch } from "vue";
import { _t } from '@/utils/common';

const configModalShow = ref(false);
const openConfigModal = () => {
  configModalShow.value = true;
}

const emit = defineEmits(['change']);

const formRef = ref();
const configForm = reactive({
  name: '',
  host: 'localhost',
  port: '3306',
  username: '',
  password: '',
});
watch(() => configForm, (newVal) => {
  configForm.name = `${configForm.username}@${configForm.host}:${configForm.port}`;
}, {
  immediate: true,
  deep: true,
});

const configList = ref([]);
const cacheKey = 'conn-select2-config-list';
const localConfigList = localStorage.getItem(cacheKey);
if (localConfigList) {
  configList.value = JSON.parse(localConfigList);
}
// configList变化时，将数据存储到localStorage
watch(() => configList.value, (newVal) => {
  localStorage.setItem(cacheKey, JSON.stringify(newVal));
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

/**
 * 创建数据库连接
 * @param config
 * @returns {Promise<void>}
 */
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

// 删除数据库连接
const deleteConn = (index) => {
  configList.value.splice(index, 1);
}

const expandDatabase = async (db) => {
  if (db.tableList.length > 0) return;
  const res = await nodeObj.db.execSql(connId, `show tables from ${_t(db.dbname)}`);
  const tables = res.result;
  db.tableList = tables.map(o => ({name: o[`Tables_in_${db.dbname}`]}));
}

const openTable = async (database, table) => {
  emit('change', {connId, database, table})
}

const onReset = () => {
  console.log('重置表单');
  formRef.value.reset();
}

</script>

<style lang="scss">
.conn-select2 {
  width: 200px;
}
</style>
