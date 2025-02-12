<template>
  <div class="editor-widget" ref="editor"></div>
</template>

<script setup>
import * as monaco from 'monaco-editor';
import {onMounted, ref} from "vue";

const editor = ref();

function initMonaco() {
  monaco.editor.create(editor.value, {
    value: 'SELECT * FROM table_name',
    language: 'javascript',
    theme: 'vs-light'
  });
}

onMounted(() => {
  initMonaco();
});
</script>

<style>
.editor-widget {
  width: 800px;
  height: 600px;
  border: 1px solid #ccc;
}
</style>
