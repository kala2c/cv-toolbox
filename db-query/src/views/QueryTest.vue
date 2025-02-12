<template>
  <div class="query-test">
    {{ connInfo }}
    <conn-select v-model="connInfo"></conn-select>
    <text-editor v-model="sql" default-language="sql"></text-editor>
  </div>
</template>
<script setup>
import { ref } from "vue";
import ConnSelect from "@/components/ConnSelect.vue";
import TextEditor from "@/components/TextEditor.vue";

const connInfo = ref({
  connId: "",
  database: "",
});

const sql = ref('');
</script>