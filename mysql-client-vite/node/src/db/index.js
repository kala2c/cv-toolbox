import mysql from 'mysql2/promise';
import { generateRandomStr } from "../utils/data";

const connMap = {};

/**
 * 创建数据库连接
 * @param config
 */
export async function createConnection(config) {
    console.log("556")
    const { host, port, username, password } = config;
    console.log('创建数据库连接', host, port, username, password);
    try {
        const conn = await mysql.createConnection({
            host,
            port,
            user: username,
            password,
        });
        const connId = generateRandomStr(16);
        connMap[connId] = conn;
        return connId;
    } catch (e) {
        console.log(e);
        return null;
    }
}

/**
 * 执行 SQL
 * @param connId
 * @param sql
 */
export async function execSql(connId, sql) {
    const conn = connMap[connId];
    if (!conn) {
        return { error: 'invalid connId' };
    }
    try {
        const [result, fields] = await conn.execute(sql);
        return { result, fields };
    } catch (err) {
        return { error: err.message };
    }
}

/**
 * 关闭连接
 * @param connId
 */
export function closeConnection(connId) {
    const conn = connMap[connId];
    if (conn) {
        conn.destroy();
        delete connMap[connId];
    }
}