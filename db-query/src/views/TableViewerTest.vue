<template>
  <div class="table-viewer-test">
    <conn-select @changeTable="handleTableChange" @changeConn="handleConnChange"></conn-select>
    <table-viewer
        ref="viewerRef"
        :table-name="connData.table"
        :database="connData.database"
        :conn-id="connData.connId"
        :height="'calc(100vh - 54px)'"
    >
      <template #right-bottom>
        <div class="action-item" @click="toHome">
          <vxe-icon name="home"></vxe-icon>
        </div>
      </template>
    </table-viewer>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import ConnSelect from "@/components/ConnSelect.vue";
import TableViewer from "@/components/TableViewer";
import { useRouter } from "vue-router";

const router = useRouter();

const viewerRef = ref();

const connData = reactive({
  connId: "",
  database: "",
  table: "",
});

const handleTableChange = ({ connId, database, table }) => {
  connData.connId = connId;
  connData.database = database;
  connData.table = table;
};

const handleConnChange = (config) => {
  connData.connId = '';
  connData.database = '';
  connData.table = '';
  viewerRef.value && viewerRef.value.clearAll();
};

const toHome = () => {
  router.push('/');
};
</script>

<style lang="scss">
.table-viewer-test {
  box-sizing: border-box;
  padding: 8px;
}
</style>

