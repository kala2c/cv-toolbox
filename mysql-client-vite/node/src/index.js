import * as db from './db';

const nodeObj = {
    db
}

// 在window上挂载nodeObj对象
window.nodeObj = nodeObj;