const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.send('Hello World!');
});

const connMap = {};

/**
 * 创建数据库连接
 */
app.post('/createConn', (req, res) => {
    const { host, port, username, password } = req.body;
    const conn = mysql.createConnection({
        host,
        port,
        user: username,
        password,
    });
    const connId = generateRandomStr(16);
    connMap[connId] = conn;

    res.json({ connId });
});

/**
 * 执行 SQL
 */
app.post('/execSql', (req, res) => {
    const { connId, sql } = req.body;
    const conn = connMap[connId];
    if (!conn) {
        res.json({ error: 'invalid connId' });
    }
    conn.query(sql, (err, result) => {
        if (err) {
            res.json({ error: err.message });
        } else {
            res.json({ result });
        }
    });
});

const port = 7120;

app.listen(port, () => {
    console.log('app is running on port：' + port);
});

function generateRandomStr(length) {
    const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += str[Math.floor(Math.random() * str.length)];
    }
    return result;
}