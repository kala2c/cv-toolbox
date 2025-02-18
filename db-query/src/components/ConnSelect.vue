<template>
  <div class="conn-select">
    <div class="config-row">
      <div>
        <vxe-select class="config-select" v-model="currentConfigStore" @change="handleConfigListChange">
          <vxe-option
              v-for="config in configListStore"
              :key="config.name"
              :label="config.name"
              :value="config.name"
          ></vxe-option>
        </vxe-select>
        <span class="conn-status" :class="connectionStatus"></span>
        <vxe-button @click="showConfig = !showConfig">
          {{ showConfig ? '收起' : '编辑' }}
        </vxe-button>
        <vxe-button @click="createDbConn">连接</vxe-button> 
      </div>
      <div class="select-inline">
        <span>数据库</span>
        <vxe-select class="select-item" v-model="config.currentDatabase" :data="databaseList" @change="changeDb">
          <vxe-option v-for="item in databaseList" :key="item.value" :label="item.label" :value="item.value"></vxe-option>
        </vxe-select>
        
        <template v-if="showTable">
          <span>表</span>
          <vxe-select class="select-item" v-model="config.currentTable" :data="tableList" @change="changeTable">
            <vxe-option v-for="item in tableList" :key="item.value" :label="item.label" :value="item.value"></vxe-option>
          </vxe-select>
        </template>
      </div>
    </div>
    <div v-show="showConfig" class="params-row">
        <vxe-input v-model="config.name" @input="onNameInput" placeholder="名称"></vxe-input>
        <vxe-input v-model="config.host" placeholder="主机"></vxe-input>
        <vxe-input v-model="config.port" placeholder="端口"></vxe-input>
        <vxe-input v-model="config.username" placeholder="用户名"></vxe-input>
        <vxe-input v-model="config.password" placeholder="密码"></vxe-input>
        <!-- <vxe-button @click="saveConfig">保存</vxe-button> -->
      </div>
  </div>
</template>

<script setup>
import { VxeUI } from 'vxe-pc-ui';
import { reactive, ref, watch } from "vue";
import { _t, showToast } from "@/utils/common";

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

const emit = defineEmits(['update:modelValue', 'changeTable', 'changeConn']);

const config = reactive({
  name: '',
  host: '121.196.198.72',
  port: '7002',
  username: 'hello-world',
  password: 'mx42LjBaBTkCBpT3',

  currentDatabase: '',
  currentTable: '',
});

// 添加标记，用于判断用户是否手动编辑过name
const isNameManuallyEdited = ref(false);
// 手动编辑name时，设置标记
const onNameInput = () => {
  isNameManuallyEdited.value = true;
};
// 监听相关字段变化，自动生成name
watch([() => config.username, () => config.host, () => config.port], () => {
  if (!isNameManuallyEdited.value) {
    config.name = `${config.username}@${config.host}:${config.port}`;
  }
});

const connId = ref('');

const databaseList = ref([]);
const tableList = ref([]);

const configListStore = ref([
  { name: '1.26-helloworld', host: '121.196.198.72', port: '7002', username: 'hello-world', password: 'mx42LjBaBTkCBpT3' },
  { name: '数图mysql', host: '192.168.3.240', port: '3306', username: 'root', password: 'root' },
]);
configListStore.value.push({
  name: '新链接',
  host: 'localhost',
  port: '3306',
  username: '',
  password: '',
});

// 修改：从localStorage读取已保存的配置列表
const savedConfigs = localStorage.getItem('config-list');
if (savedConfigs) {
  configListStore.value = JSON.parse(savedConfigs);
}

const showConfig = ref(false);

// Add connection status ref
const connectionStatus = ref('disconnected');

async function createDbConn() {
  // 检查参数是否完整
  if (!config.host || !config.port || !config.username) {
    showToast('请输入完整参数', 'error');
    return;
  }
  try {
    connectionStatus.value = 'connecting';
    databaseList.value = [];
    tableList.value = [];
    config.currentDatabase = '';
    config.currentTable = '';
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
    if (databaseList.value.length > 0) {
      config.currentDatabase = databaseList.value[0].value;
      await changeDb();
    }
    connectionStatus.value = 'connected';
    saveConfig();
  } catch (error) {
    console.error('Connection failed:', error);
    connectionStatus.value = 'error';
  }
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
  emit('changeTable', data);
  emit('update:modelValue', data);
}

// 链接存储
const currentConfigStore = ref('');
const handleConfigListChange = () => {
  const configStore = configListStore.value.find(o => o.name === currentConfigStore.value);
  config.name = configStore.name;
  config.host = configStore.host;
  config.port = configStore.port;
  config.username = configStore.username;
  config.password = configStore.password;
  // 如果name不符合生成规则，则重置标记
  const isNameMatch = config.name === `${config.username}@${config.host}:${config.port}`;
  if (config.name === '新链接') {
    isNameManuallyEdited.value = false;
    config.name = '';
    showConfig.value = true;
  } else {
    isNameManuallyEdited.value = isNameMatch;
  }
  connectionStatus.value = 'disconnected';
  emit('changeConn', config);
}
currentConfigStore.value = configListStore.value[0].name;
handleConfigListChange();

// 添加：保存配置列表的方法
const saveConfig = () => {
  // 检查是否存在同名配置
  const existingConfig = configListStore.value.find(o => o.name === config.name);
  if (existingConfig) {
    // 更新已存在的配置
    Object.assign(existingConfig, {
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password
    });
  } else {
    // 添加新配置
    configListStore.value.push({
      name: config.name,
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password
    });
  }
  // 保存到localStorage
  localStorage.setItem('config-list', JSON.stringify(configListStore.value));
}
</script>

<style lang="scss">
.conn-select {
  .config-row {
    display: flex;
    align-items: center;
    // justify-content: space-between;
    // gap: 8px;
    // flex-wrap: wrap;
    .config-select {
      width: 200px;
      margin-right: 8px;
    }
  }

  .params-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    margin-top: 8px;
    margin-bottom: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    .vxe-input {
      width: 150px;
    }
  }

  .select-inline {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 15px;
    // margin-left: auto;
    span {
      white-space: nowrap;
    }
    .select-item {
      width: 200px;
    }
  }

  .conn-status {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 8px;
    
    &.disconnected {
      background-color: #999;
    }
    
    &.connecting {
      background-color: #f0ad4e;
    }
    
    &.connected {
      background-color: #5cb85c;
    }
    
    &.error {
      background-color: #d9534f;
    }
  }
}
</style>
