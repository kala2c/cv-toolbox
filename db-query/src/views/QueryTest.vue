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
    <vxe-button @click="onFormat">美化SQL</vxe-button>
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
    <div v-if="isError">
      <p>SQL执行错误：</p>
      {{ errorMsg }}
    </div>
  </div>
</template>
<script setup>
import { VxeUI } from 'vxe-pc-ui';
import { ref } from "vue";
import ConnSelect from "@/components/ConnSelect.vue";
import TextEditor from "@/components/TextEditor.vue";
import moment from "moment";
import * as SqlFormatter from "sql-formatter";

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
const isError = ref(false);
const errorMsg = ref('');

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
  const sqlStr = sql.value + '';
  const firstSQL = sqlStr.split(';')[0];
  // 第一条语句是否是 use `tableName`;
  const firstIsUse = firstSQL.toLowerCase().startsWith('use');
  const res = await nodeObj.db.query(connInfo.value.connId, sql.value);
  let { result, fields, error } = res;
  if (error) {
    isQuery.value = false;
    isError.value = true;
    errorMsg.value = error;
    return;
  }
  isQuery.value = true;
  isError.value = false;
  // 判断多条是否SQL查询 判断依据fields和result多条查询时为二维数组 即 [查询结果1, 查询结果2]-查询结果本身就是数组
  if (fields[0] instanceof Array) {
    // 多条查询 第一条是use时去掉第一个结果
    result = firstIsUse ? result.slice(1) : result;
    fields = firstIsUse ? fields.slice(1) : fields;
  } else {
    // 单条查询结果也包装成二维数组 以便统一处理
    result = [result];
    fields = [fields];
  }
  // result和fields是二维数组
  // 表格数据
  console.log(fields, result);
  resultColumn.value = fields.map(colList => colList.map(col => {
    return {
      name: col.name,
      type: col.type, // 这里的type是枚举
    }
  }));
  resultData.value = result.map((tableData, resultIndex) => {
    const columns = resultColumn.value[resultIndex];
    return tableData.map(row => {
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
  jsonData.value = resultData.value.map(tableData => JSON.stringify(tableData, null, 2));
};

const onFormat = () => {
  sql.value = SqlFormatter.format(sql.value, {
    language: 'mysql', // 语言类型
    // indent: '    ',    // 缩进，默认是 2 个空格
    // uppercase: true, // 是否将关键字转为大写
  });
};
</script>