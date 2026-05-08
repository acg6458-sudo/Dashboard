import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

async function updatePasswords() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'dashboard_db'
  });

  try {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.execute(
      'UPDATE users SET password = ?',
      [hashedPassword]
    );

    console.log('✓ 密码更新成功');

    const [rows] = await connection.execute('SELECT id, username, role FROM users');
    console.log('\n用户列表:');
    rows.forEach(user => {
      console.log(`  - ${user.username} (${user.role})`);
    });

  } finally {
    await connection.end();
  }
}

updatePasswords();
