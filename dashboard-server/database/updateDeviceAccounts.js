import mysql from 'mysql2/promise';

async function updateDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'dashboard_db'
  });

  try {
    console.log('正在检查和更新数据库表结构...\n');

    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'dashboard_db'
        AND TABLE_NAME = 'devices'
        AND COLUMN_NAME IN ('username', 'password', 'port')
    `);

    const existingColumns = columns.map(col => col.COLUMN_NAME);

    if (!existingColumns.includes('username')) {
      await connection.execute(`
        ALTER TABLE devices
        ADD COLUMN username VARCHAR(50) DEFAULT NULL COMMENT '设备登录账号' AFTER ip
      `);
      console.log('✓ 添加了 username 字段');
    }

    if (!existingColumns.includes('password')) {
      await connection.execute(`
        ALTER TABLE devices
        ADD COLUMN password VARCHAR(255) DEFAULT NULL COMMENT '设备登录密码' AFTER username
      `);
      console.log('✓ 添加了 password 字段');
    }

    if (!existingColumns.includes('port')) {
      await connection.execute(`
        ALTER TABLE devices
        ADD COLUMN port INT DEFAULT 22 COMMENT 'SSH/管理端口' AFTER password
      `);
      console.log('✓ 添加了 port 字段');
    }

    await connection.execute(`
      UPDATE devices SET
        username = CASE name
          WHEN 'Web Server 01' THEN 'webadmin'
          WHEN 'Database Server' THEN 'dbadmin'
          WHEN 'Firewall Primary' THEN 'fwadmin'
          WHEN 'Firewall Backup' THEN 'fwbackup'
          WHEN 'Core Switch 01' THEN 'swadmin'
          WHEN 'Access Switch 02' THEN 'swaccess'
        END,
        password = CASE name
          WHEN 'Web Server 01' THEN '$2b$10$CbBl2Jqw9Lp73pzz5QsrwOI9jVl.ypW9VDX6FXwSmHDp2glMacYzu'
          WHEN 'Database Server' THEN '$2b$10$CbBl2Jqw9Lp73pzz5QsrwOI9jVl.ypW9VDX6FXwSmHDp2glMacYzu'
          WHEN 'Firewall Primary' THEN '$2b$10$CbBl2Jqw9Lp73pzz5QsrwOI9jVl.ypW9VDX6FXwSmHDp2glMacYzu'
          WHEN 'Firewall Backup' THEN '$2b$10$CbBl2Jqw9Lp73pzz5QsrwOI9jVl.ypW9VDX6FXwSmHDp2glMacYzu'
          WHEN 'Core Switch 01' THEN '$2b$10$CbBl2Jqw9Lp73pzz5QsrwOI9jVl.ypW9VDX6FXwSmHDp2glMacYzu'
          WHEN 'Access Switch 02' THEN '$2b$10$CbBl2Jqw9Lp73pzz5QsrwOI9jVl.ypW9VDX6FXwSmHDp2glMacYzu'
        END,
        port = CASE name
          WHEN 'Web Server 01' THEN 22
          WHEN 'Database Server' THEN 3306
          WHEN 'Firewall Primary' THEN 443
          WHEN 'Firewall Backup' THEN 443
          WHEN 'Core Switch 01' THEN 22
          WHEN 'Access Switch 02' THEN 22
        END
    `);

    console.log('✓ 初始化设备账号数据');

    const [rows] = await connection.execute('SELECT id, name, username, port FROM devices');
    console.log('\n设备账号列表:');
    rows.forEach(device => {
      console.log(`  ${device.name}: ${device.username} (端口: ${device.port})`);
    });

    console.log('\n✅ 数据库更新完成！');
    console.log('提示: 所有设备密码已设置为 admin123');

  } catch (error) {
    console.error('更新失败:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

updateDatabase();
