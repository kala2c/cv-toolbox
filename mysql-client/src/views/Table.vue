<template>
  <view></view>
</template>

<script setup>
import axios from "axios";

const params = {
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: 'root',
}
axios.post("http://localhost:7120/createConn", params)
    .then(res => {
      const connId = res.data.connId;
      axios.post("http://localhost:7120/execSql", {
        connId: connId,
        sql: "show databases"
      }).then(res => {
        console.log(res.data);
      }).catch(err => {
        console.log(err);
      });
    }).catch(err => {
      console.log(err);
    });
</script>