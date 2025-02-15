<template>
  <div style="display: flex">
    <conn-select2 @change="handleConnChange"></conn-select2>
    <table-viewer
        style="flex: 1"
        :table-name="connData.table"
        :database="connData.database"
        :conn-id="connData.connId"
    ></table-viewer>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import ConnSelect2 from "@/components/ConnSelect2.vue";
import TableViewer from "@/components/TableViewer";

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
