import mysql from 'mysql2/promise';

async function addComputerDevice() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'dashboard_db'
  });

  try {
    console.log('正在添加电脑主机设备...\n');

    const [existingDevices] = await connection.execute(
      "SELECT id FROM devices WHERE name = 'Workstation 01'"
    );

    if (existingDevices.length === 0) {
      const hashedPassword = '$2b$10$CbBl2Jqw9Lp73pzz5QsrwOI9jVl.ypW9VDX6FXwSmHDp2glMacYzu';

      await connection.execute(`
        INSERT INTO devices (name, type, ip, username, password, port, status, uptime)
        VALUES ('Workstation 01', 'computer', '192.168.1.20', 'wkmadmin', ?, 3389, 'online', '7天 3小时')
      `, [hashedPassword]);

      console.log('✓ 已添加电脑主机设备');
    } else {
      console.log('✓ 电脑主机设备已存在');
    }

    const [rows] = await connection.execute('SELECT id, name, type, username, port FROM devices WHERE type = "computer"');
    console.log('\n电脑主机设备:');
    rows.forEach(device => {
      console.log(`  ${device.name}: ${device.username} (端口: ${device.port})`);
    });

    console.log('\n✅ 更新完成！');

  } catch (error) {
    console.error('更新失败:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

addComputerDevice();
