import mysql from 'mysql2/promise';

async function updateDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'dashboard_db'
  });

  try {
    console.log('正在添加 CPU型号 字段...');
    await connection.query('ALTER TABLE devices ADD COLUMN cpu_model VARCHAR(100) DEFAULT NULL COMMENT "CPU型号" AFTER memory');
    console.log('✓ CPU型号 字段添加成功');

    console.log('正在添加 内存大小 字段...');
    await connection.query('ALTER TABLE devices ADD COLUMN memory_size VARCHAR(50) DEFAULT NULL COMMENT "内存大小" AFTER cpu_model');
    console.log('✓ 内存大小 字段添加成功');

    const [rows] = await connection.query('DESC devices');
    console.log('\n当前设备表字段列表:');
    rows.forEach(r => console.log(`  - ${r.Field}: ${r.Type}`));

    console.log('\n✅ 数据库字段添加成功！');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('字段已存在，跳过添加');
    } else {
      console.error('添加字段失败:', error.message);
    }
  } finally {
    await connection.end();
  }
}

updateDatabase();
