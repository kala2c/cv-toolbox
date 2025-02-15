<template>
  <div class="query-test">
    {{ connInfo }}
    <conn-select v-model="connInfo"></conn-select>
    <text-editor v-model="sql" default-language="sql"></text-editor>
    <br>
    <span>结果模板：</span>
    <vxe-select v-model="currentResultTemplate">
      <vxe-option v-for="item in resultTemplateList" :key="item.value" :label="item.name" :value="item.value"></vxe-option>
    </vxe-select>
    <vxe-button @click="execQuery">执行查询</vxe-button>
    <div v-if="isQuery">
      <div v-if="currentResultTemplate === 'default-table'">
        <div
            v-for="(tableData, index) in resultData"
            :key="index">
          <p>结果{{ index+1 }}：</p>
          <vxe-table :data="tableData">
            <vxe-column
                v-for="(column) in resultColumn[index]"
                :key="column.name"
                :field="column.name"
                :title="column.name"
            ></vxe-column>
          </vxe-table>
        </div>
      </div>
      <div v-else-if="currentResultTemplate === 'default-json'">
        <div v-for="(json, index) in jsonData" :key="index">
          <p>结果{{ index+1 }}：</p>
          <pre><code>{{ json }}</code></pre>
        </div>
      </div>
      <div v-else>
        <iframe src="./query-result.html"></iframe>
      </div>
    </div>
  </div>
</template>
<script setup>
import { VxeUI } from 'vxe-pc-ui';
import { ref } from "vue";
import ConnSelect from "@/components/ConnSelect.vue";
import TextEditor from "@/components/TextEditor.vue";
import moment from "moment";

const connInfo = ref({
  connId: "",
  database: "",
});

const sql = ref('SELECT * FROM `posts`');

// 每个1秒缓存一次
const cacheKey = 'query-test-sql';
const sqlValueCache = localStorage.getItem(cacheKey);
if (sqlValueCache) {
  sql.value = sqlValueCache;
}
setInterval(() => {
  localStorage.setItem(cacheKey, sql.value);
}, 1000);

const isQuery = ref(false);

// 结果模板
const currentResultTemplate = ref('default-table');
const resultTemplateList = ref([
  {
    name: '默认表格',
    value: 'default-table',
    code: '',
  },
  {
    name: '默认JSON',
    value: 'default-json',
    code: '',
  },
]);

const resultColumn = ref([]);
const resultData = ref([]);
const jsonData = ref([]);
const execQuery = async () => {
  if (!isQuery.value) isQuery.value = true;
  const sqlStr = sql.value + '';
  const firstSQL = sqlStr.split(';')[0];
  // 第一条语句是否是 use `tableName`;
  const firstIsUse = firstSQL.toLowerCase().startsWith('use');
  const res = await nodeObj.db.query(connInfo.value.connId, sql.value);
  let { result, fields } = res;
  if (result instanceof Array && fields instanceof Array) {
    // 多条查询 第一条是use时去掉第一个结果
    result = firstIsUse ? result.slice(1) : result;
    fields = firstIsUse ? fields.slice(1) : fields;
  } else {
    // 单条查询结果也包装成数组 以便统一处理
    result = [result];
    fields = [fields];
  }
  // 表格数据
  resultColumn.value = fields.map(o => o.map(col => {
    return {
      name: col.name,
      type: col.type, // 这里的type是枚举
    }
  }));
  resultData.value = result.map((o, resultIndex) => {
    const columns = resultColumn.value[resultIndex];
    return o.map(row => {
      // 逐列处理查询结果中的数据
      columns.forEach(col => {
        if (col.type === 12) {
          // mysql datetime类型
          row[col.name] = moment(row[col.name]).format('YYYY-MM-DD HH:mm:ss');
        }
      });
      return row;
    });
  });
  // json数据
  jsonData.value = resultData.value.map(o => JSON.stringify(o, null, 2));
};
</script>