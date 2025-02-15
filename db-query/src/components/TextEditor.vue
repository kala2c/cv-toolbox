<template>
  <div class="text-editor">
    <vxe-select v-model="baseOptions.theme" @change="handleThemeChange">
      <vxe-option v-for="item in ['vs-light', 'vs-dark']" :key="item" :value="item" :label="item"></vxe-option>
    </vxe-select>
    <vxe-select v-model="baseOptions.language" @change="handleLanguageChange">
      <vxe-option v-for="item in ['text', 'json', 'javascript', 'sql']" :key="item" :value="item" :label="item"></vxe-option>
    </vxe-select>
    <div class="editor-widget" ref="editorRef"></div>
  </div>
</template>

<script setup>
import { VxeUI } from 'vxe-pc-ui';
import * as monaco from 'monaco-editor';
import { onMounted, ref, watch, reactive } from 'vue';
import { debounce } from 'lodash';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  // 'text' | 'json' | 'javascript' | 'sql'
  defaultLanguage: {
    type: String,
    default: 'text'
  },
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 600
  }
});

const emit = defineEmits(['update:modelValue']);

const editorRef = ref();
let editor = null;

const baseOptions = reactive({
  language: 'text',
  theme: 'vs-light'
});

watch(() => props.modelValue, debounce((newVal, oldVal) => {
  const val = editor.getValue();
  if (val === newVal) return;
  editor && editor.setValue(newVal);
}, 200));
watch(() => props.defaultLanguage, (newVal) => {
  baseOptions.language = newVal;
  if (editor) {
    monaco.editor.setModelLanguage(editor.getModel(), baseOptions.language);
  }
}, {
  immediate: true
});

function handleThemeChange(evt) {
  // baseOptions.theme = evt.value;
  monaco.editor.setTheme(baseOptions.theme);
}
function handleLanguageChange(evt) {
  // baseOptions.language = evt.value;
  monaco.editor.setModelLanguage(editor.getModel(), baseOptions.language);
}

function initMonaco() {
  editor = monaco.editor.create(editorRef.value, {
    value: props.modelValue,
    language: baseOptions.language,
    theme: baseOptions.theme,
  });

  editor.onDidChangeModelContent(() => {
    const value = editor.getValue();
    emit('update:modelValue', value);
  });
}

onMounted(() => {
  initMonaco();
});
</script>

<style>
.editor-widget {
  width: 800px;
  height: 300px;
  border: 1px solid #ccc;
}
</style>