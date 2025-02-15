import mysql from 'mysql2/promise';
import { generateRandomStr } from "../utils/data";

const connMap = {};

const getConnInstance = (connId) => {
    const conn = connMap[connId];
    if (!conn) {
        return null;
    }
    return conn.instance;
};

/**
 * 获取当前链接的信息
 * @param connId
 */
export async function getConnInfo(connId) {
    const conn = connMap[connId];
    if (!conn) {
        return null;
    }
    return {
        connId,
        database: conn.database,
    }
}

/**
 * 创建数据库连接
 * @param config
 */
export async function createConnection(config) {
    const { host, port, username, password } = config;
    console.log('创建数据库连接', host, port, username, password);
    try {
        const conn = await mysql.createConnection({
            host,
            port,
            user: username,
            password,
            // 允许一次执行多条sql语句
            multipleStatements: true
        });
        const connId = generateRandomStr(16);
        connMap[connId] = {
            instance: conn,
            database: ''
        };
        return connId;
    } catch (e) {
        console.log('数据库连接创建失败', e);
        return null;
    }
}

/**
 * 执行 SQL
 * @param connId
 * @param sql
 */
export async function execSql(connId, sql) {
    const conn = getConnInstance(connId);
    if (!conn) {
        return { error: 'invalid connId' };
    }
    console.log('执行 SQL', sql);
    try {
        const res = await conn.execute(sql);
        const [result, fields] = res;
        return { result, fields };
    } catch (err) {
        console.log('执行 SQL 失败', err)
        return { error: err.message };
    }
}

export async function query(connId, sql) {
    const conn = getConnInstance(connId);
    if (!conn) {
        return { error: 'invalid connId' };
    }
    // const connInfo = await getConnInfo(connId);
    // if (connInfo.database) {
    //     sql = "use `" + connInfo.database + "`;\n" + sql;
    // }
    console.log('执行 SQL', sql);
    try {
        const res = await conn.query(sql);
        const [result, fields] = res;
        return { result, fields };
    } catch (err) {
        console.log('执行 SQL 失败', err)
        return { error: err.message };
    }
}

/**
 * 切换数据库
 * @param connId
 * @param database
 * @returns {Promise<{error}|{}|{error: string}>}
 */
export async function changeDatabase(connId, database) {
    console.log('切换数据库conn.changeUser', connId, database);
    const conn = getConnInstance(connId);
    if (!conn) {
        return { error: 'invalid connId' };
    }
    // 会报错
    await conn.changeUser({
        database
    });
    connMap[connId].database = database;
    return {};
}

/**
 * 关闭连接
 * @param connId
 */
export function closeConnection(connId) {
    const conn = getConnInstance(connId);
    if (conn) {
        conn.destroy();
        delete connMap[connId];
    }
}