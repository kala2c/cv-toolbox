<template>
  <div class="action-item" :class="{ disabled }">
    <div class="tooltip" v-if="title">{{ title }}</div>
    <vxe-icon :name="icon" @click="handleClick"></vxe-icon>
  </div>
</template>

<script setup>
const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

const handleClick = () => {
  if (props.disabled) return;
  emit('click');
};
</script>

<style lang="scss" scoped>
.action-item {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 34px;
  font-size: 18px;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
    
    .tooltip {
      display: block;
    }
  }
  
  &.disabled {
    color: #c0c4cc;
    cursor: not-allowed;
    &:hover {
      background-color: transparent;
    }
  }

  .tooltip {
    display: none;
    position: absolute;
    top: -30px;
    right: 0;
    padding: 4px 8px;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
  }
}
</style>
