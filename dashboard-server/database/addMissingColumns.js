import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'dashboard_db'
});

try {
  await conn.query(`
    ALTER TABLE devices 
    ADD COLUMN username VARCHAR(50) NULL COMMENT '管理账号',
    ADD COLUMN password VARCHAR(255) NULL COMMENT '登录密码',
    ADD COLUMN port INT DEFAULT 22 COMMENT 'SSH端口',
    ADD COLUMN cpu_model VARCHAR(100) NULL COMMENT 'CPU型号',
    ADD COLUMN memory_size VARCHAR(50) NULL COMMENT '内存大小'
  `);
  console.log('字段添加成功');
} catch (e) {
  if (e.code === 'ER_DUP_FIELDNAME') {
    console.log('字段已存在');
  } else {
    throw e;
  }
}

const [columns] = await conn.query('DESCRIBE devices');
console.log('更新后的列:', columns.map(c => c.Field));

await conn.end();
