<template>
  <div
      ref="areaRef"
      class="edit-area-div"
      contenteditable="true"
      @input="handleInput($event)"
  >{{ modelValue }}</div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
});

const areaRef = ref();

const emit = defineEmits(['update:modelValue', 'change']);

const handleInput = (evt) => {
  emit('update:modelValue', evt.target.innerText);
  nextTick(() => {
    emit('change', props.modelValue);
  });
}
</script>

<style lang="scss">
.edit-area-div {
  box-sizing: border-box;
  padding: 0 10px;
  height: 34px;
  line-height: 34px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>
