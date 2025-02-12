const mysql = require("mysql2/promise");
const moment = require("moment");


const sql = `show databases;`;

(async function main() {
    const conn = await mysql.createConnection({
        host: '121.196.198.72',
        port: '7002',
        user: 'hello-world',
        password: 'mx42LjBaBTkCBpT3',
    });

    let [results, fields] = await conn.execute(sql);
    // console.log('查询的字段信息:', fields);
    console.log('查询的结果:', JSON.stringify(results, null, 2));
    conn.destroy();
})();