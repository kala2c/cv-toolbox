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

    <vxe-table :data="tableData">
      <vxe-column type="seq" width="60"></vxe-column>
      <vxe-column field="name" title="Name"></vxe-column>
      <vxe-column field="sex" title="Sex"></vxe-column>
      <vxe-column field="age" title="Age"></vxe-column>
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
import {reactive, ref} from "vue";

const configModalShow = ref(false);
const openConfigModal = () => {
  configModalShow.value = true;
}

const configForm = reactive({
  name: '',
  host: '121.196.198.72',
  port: '7002',
  username: 'hello-word',
  password: 'mx42LjBaBTkCBpT3',
});

const configList = ref([]);

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

const createDbConn = async (config) => {

  connId = await nodeObj.db.createConnection({
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password
  })
  const databases = await nodeObj.db.execSql(connId, 'show databases');
  console.log(databases);
}

const onReset = () => {
  console.log('reset');
}

const tableData = ref([
  {name: 'test', sex: '1', age: 26},
  {name: 'ss', sex: '0', age: 30},
  {name: 'test', sex: '1', age: 26}
]);
</script>