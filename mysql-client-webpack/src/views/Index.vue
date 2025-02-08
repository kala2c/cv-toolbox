<template>
  <div>
    <div class="top">
      <router-link to="/editor">Editor</router-link>
      <router-link to="/about">About</router-link>
      <router-link to="/test">test</router-link>
      <router-link to="/table">Table</router-link>
    </div>
    <div class="content">
      <div class="side"></div>
      <div class="main">
        <TableViewer></TableViewer>
      </div>
    </div>
  </div>
</template>
<script setup>
import TableViewer from "@/components/TableViewer.vue";
</script>