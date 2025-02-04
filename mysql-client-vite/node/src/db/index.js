import mysql from 'mysql2/promise';
import { generateRandomStr } from "../utils/data";

const connMap = {};

/**
 * 创建数据库连接
 * @param config
 */
export async function createConnection(config) {
    const { host, port, username, password } = config;
    const conn = await mysql.createConnection({
        host,
        port,
        user: username,
        password,
    });
    const connId = generateRandomStr(16);
    connMap[connId] = conn;
    return connId;
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
        const [result] = await conn.execute(sql);
        return { result };
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