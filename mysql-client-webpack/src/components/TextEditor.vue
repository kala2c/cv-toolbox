<template>
  <div class="text-editor">
    {{ props.value }}
    <div class="editor-widget" ref="editor"></div>
  </div>
</template>

<script setup>
import * as monaco from 'monaco-editor';
import {onMounted, ref} from "vue";

const props = defineProps({
  value: {
    type: String,
    default: ''
  }
});
const emit = defineEmits(['update:value']);

const editor = ref();

function initMonaco() {
  monaco.editor.create(editor.value, {
    value: 'const a = "hello"',
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