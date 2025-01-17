import express from 'express';
import * as net from "node:net";

/**
 * 寻找可用的端口
 * @returns {string|number}
 */
let startPort = 21233;
function findPort(port) {
    port = port || startPort;
    // 判断端口是否被占用
    return new Promise((resolve) => {
        const server = net.createServer().listen(port);
        server.on('listening', () => {
            server.close();
            console.log('发现可用端口：' + port);
            resolve(port);
        });
        server.on('error', () => {
            return findPort(port + 1);
        });
    });
}

// 启动web服务
const app = express();
// 静态资源
app.use(express.static('resources'));
(async () => {
    const port = await findPort();
    app.listen(port, () => {
        console.log(`server is running at http://127.0.0.1:${port}`);
    });
})();
