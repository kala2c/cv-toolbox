const mysql = require("mysql2/promise");
const moment = require("moment");


const sql = `
    SELECT 
    dsp.id, 
    dsp.end_date as endDate, 
    dsp.ledger_num as ledgerNum, 
    dsp.par_pattern_id as parPatternID, 
    dsp.par_shelf_num as parShelfNum, 
    dsp.pattern_cd as patternCD, 
    dsp.pattern_id as patternID, 
    dsp.purchasing_center_id as purchasingCenterID, 
    dsp.shelf_cd as shelfCD, 
    dsp.shelf_num as shelfNum, 
    dsp.shelf_type_cd as shelfTypeCD, 
    dsp.start_date as startDate, 
    dsp.status as status, 
    dsp.store_id as storeID, 
    dsp.co_no as coNo, 
    dsp.market_type as marketType,
    dsp.create_time as createTime,
    pi.display_attr_cd as displayAttrCd,
    pi.display_attr_cd as displayAttrCD
FROM
    dsp_store_shelf_ledger_relation dsp
LEFT JOIN pattern_info pi on pi.pattern_id = dsp.pattern_id 
WHERE
    1=1
AND status=1 
-- AND dsp.create_time < '2025-01-16 08:00:00'
ORDER BY id DESC
LIMIT 1
`;

(async function main() {
    const conn = await mysql.createConnection({
        host: '192.168.3.240',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'fmspm_cloud_test1'
    });

    let [results, fields] = await conn.execute(sql);
    // console.log('查询的字段信息:', fields);
    results = results.map(row => {
        row.endDate = moment(row.createTime).format("YYYY-MM-DD HH:mm:ss");
        row.createTime = moment(row.createTime).format("YYYY-MM-DD HH:mm:ss");
        row.startDate = moment(row.startDate).format("YYYY-MM-DD HH:mm:ss");
        return row;
    });
    console.log('查询的结果:', JSON.stringify(results[0], null, 2));
    conn.destroy();
})();