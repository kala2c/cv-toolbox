<template>
  <div>
    <conn-select @change="handleConnChange"></conn-select>
    <table-viewer
        :table-name="connData.table"
        :database="connData.database"
        :conn-id="connData.connId"
    ></table-viewer>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import ConnSelect from "@/components/ConnSelect.vue";
import TableViewer from "@/components/TableViewer.vue";

const connData = reactive({
  connId: "",
  database: "",
  table: "",
});

const handleConnChange = ({ connId, database, table }) => {
  connData.connId = connId;
  connData.database = database;
  connData.table = table;
};
</script>
