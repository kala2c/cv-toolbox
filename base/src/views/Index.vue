<template>
  <div class="page-container">
    <p class="text">工具箱{{ msg }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const msg = ref('测试信息');
</script>

<style lang="less">
.page-container {
  width: 500px;
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  .text {
    font-size: 20px;
    color: #007acc;
  }
}
</style>