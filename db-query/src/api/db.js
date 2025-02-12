
const db = window.nodeObj.db;

export default {
    async getConnInfo(connId) {
        return await db.getConnInfo(connId);
    },
    async query(sql, connId) {

    },
    async update(sql, connId) {

    }
}
