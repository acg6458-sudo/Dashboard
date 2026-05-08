import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query, testConnection } from './database/db.js';

const app = express();
const PORT = process.env.PORT || 4006;
const JWT_SECRET = process.env.JWT_SECRET || 'dashboard-secret-key-2024';

app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '请先登录' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token 已过期' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'Administrator') {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }
  next();
};

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '请输入用户名和密码' });
    }

    const users = await query('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      },
      message: '登录成功'
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const devices = await query('SELECT * FROM devices');
    const users = await query('SELECT * FROM users');

    const stats = {
      totalDevices: devices.length,
      onlineDevices: devices.filter(d => d.status === 'online').length,
      warningDevices: devices.filter(d => d.status === 'warning').length,
      offlineDevices: devices.filter(d => d.status === 'offline').length,
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      servers: devices.filter(d => d.type === 'server').length,
      firewalls: devices.filter(d => d.type === 'firewall').length,
      switches: devices.filter(d => d.type === 'switch').length,
      computers: devices.filter(d => d.type === 'computer').length,
      others: devices.filter(d => d.type === 'other').length
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ success: false, message: '获取统计数据失败' });
  }
});

app.get('/api/devices', authenticateToken, async (req, res) => {
  try {
    const devices = await query('SELECT id, name, type, ip, username, port, status, uptime, cpu_model, memory_size, last_check, created_at FROM devices ORDER BY id DESC');
    res.json({ success: true, data: devices, total: devices.length });
  } catch (error) {
    console.error('获取设备列表失败:', error);
    res.status(500).json({ success: false, message: '获取设备列表失败' });
  }
});

app.get('/api/devices/:id', authenticateToken, async (req, res) => {
  try {
    const devices = await query('SELECT * FROM devices WHERE id = ?', [req.params.id]);
    if (devices.length === 0) {
      return res.status(404).json({ success: false, message: '设备未找到' });
    }
    res.json({ success: true, data: devices[0] });
  } catch (error) {
    console.error('获取设备详情失败:', error);
    res.status(500).json({ success: false, message: '获取设备详情失败' });
  }
});

app.post('/api/devices', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, type, ip, username, password, port, status, uptime, cpu_model, memory_size } = req.body;

    if (!name || !type || !ip) {
      return res.status(400).json({ success: false, message: '请填写必填字段' });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const result = await query(
      'INSERT INTO devices (name, type, ip, username, password, port, status, uptime, cpu_model, memory_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, type, ip, username || null, hashedPassword, port || 22, status || 'offline', uptime || '0天 0小时', cpu_model || null, memory_size || null]
    );

    const [newDevice] = await query('SELECT * FROM devices WHERE id = ?', [result.insertId]);

    res.json({ success: true, data: newDevice, message: '设备添加成功' });
  } catch (error) {
    console.error('添加设备失败:', error);
    res.status(500).json({ success: false, message: '添加设备失败' });
  }
});

app.put('/api/devices/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, type, ip, username, password, port, status, uptime, cpu_model, memory_size } = req.body;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await query(
        'UPDATE devices SET name = ?, type = ?, ip = ?, username = ?, password = ?, port = ?, status = ?, uptime = ?, cpu_model = ?, memory_size = ?, last_check = NOW() WHERE id = ?',
        [name, type, ip, username, hashedPassword, port, status, uptime, cpu_model, memory_size, req.params.id]
      );
    } else {
      await query(
        'UPDATE devices SET name = ?, type = ?, ip = ?, username = ?, port = ?, status = ?, uptime = ?, cpu_model = ?, memory_size = ?, last_check = NOW() WHERE id = ?',
        [name, type, ip, username, port, status, uptime, cpu_model, memory_size, req.params.id]
      );
    }

    const [updatedDevice] = await query('SELECT * FROM devices WHERE id = ?', [req.params.id]);

    res.json({ success: true, data: updatedDevice, message: '设备更新成功' });
  } catch (error) {
    console.error('更新设备失败:', error);
    res.status(500).json({ success: false, message: '更新设备失败' });
  }
});

app.delete('/api/devices/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM devices WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '设备删除成功' });
  } catch (error) {
    console.error('删除设备失败:', error);
    res.status(500).json({ success: false, message: '删除设备失败' });
  }
});

app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await query('SELECT id, username, email, role, status, last_login, created_at FROM users ORDER BY id DESC');
    res.json({ success: true, data: users, total: users.length });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ success: false, message: '获取用户列表失败' });
  }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const users = await query(
      'SELECT id, username, email, role, status, last_login, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户未找到' });
    }
    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({ success: false, message: '获取用户详情失败' });
  }
});

app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, password, email, role, status } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ success: false, message: '请填写必填字段' });
    }

    const existingUsers = await query('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (username, password, email, role, status) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, email, role || 'Viewer', status || 'active']
    );

    const [newUser] = await query(
      'SELECT id, username, email, role, status, last_login, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.json({ success: true, data: newUser, message: '用户添加成功' });
  } catch (error) {
    console.error('添加用户失败:', error);
    res.status(500).json({ success: false, message: '添加用户失败' });
  }
});

app.put('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, email, role, status, password } = req.body;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await query(
        'UPDATE users SET username = ?, email = ?, role = ?, status = ?, password = ? WHERE id = ?',
        [username, email, role, status, hashedPassword, req.params.id]
      );
    } else {
      await query(
        'UPDATE users SET username = ?, email = ?, role = ?, status = ? WHERE id = ?',
        [username, email, role, status, req.params.id]
      );
    }

    const [updatedUser] = await query(
      'SELECT id, username, email, role, status, last_login, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    res.json({ success: true, data: updatedUser, message: '用户更新成功' });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({ success: false, message: '更新用户失败' });
  }
});

app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ success: false, message: '不能删除当前登录用户' });
    }

    await query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ success: false, message: '删除用户失败' });
  }
});

app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const users = await query(
      'SELECT id, username, email, role, status FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户未找到' });
    }
    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error('获取当前用户失败:', error);
    res.status(500).json({ success: false, message: '获取当前用户失败' });
  }
});

app.get('/api/health', async (req, res) => {
  const dbHealthy = await testConnection();
  res.json({
    success: true,
    data: {
      server: 'running',
      database: dbHealthy ? 'connected' : 'disconnected'
    }
  });
});

app.get('/api/database/export', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const dbInfo = {
      type: 'MySQL',
      host: 'localhost',
      port: 3306,
      database: 'dashboard_db',
      charset: 'utf8mb4',
      exportTime: new Date().toISOString(),
      tables: []
    };

    const tables = await query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    for (const tableName of tableNames) {
      const columns = await query(`SHOW FULL COLUMNS FROM \`${tableName}\``);
      const [createSQL] = await query(`SHOW CREATE TABLE \`${tableName}\``);
      const [countResult] = await query(`SELECT COUNT(*) as count FROM \`${tableName}\``);

      let tableData = [];

      if (countResult.count > 0 && !tableName.includes('users')) {
        const rows = await query(`SELECT * FROM \`${tableName}\` LIMIT 1000`);
        tableData = rows;
      }

      dbInfo.tables.push({
        name: tableName,
        columns: columns.map(col => ({
          field: col.Field,
          type: col.Type,
          null: col.Null,
          key: col.Key,
          default: col.Default,
          comment: col.Comment
        })),
        createStatement: Object.values(createSQL)[1],
        rowCount: countResult.count,
        data: tableData
      });
    }

    const sqlContent = generateSQLExport(dbInfo);

    const timestamp = new Date().format('yyyyMMddHHmmss');
    const filename = `database_${timestamp}.sql`;

    console.log(`[${new Date().toISOString()}] 数据库配置导出: 用户 ${req.user.username} 导出了数据库配置`);

    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(sqlContent);

  } catch (error) {
    console.error('导出数据库配置失败:', error);
    res.status(500).json({ success: false, message: '导出数据库配置失败: ' + error.message });
  }
});

function generateSQLExport(dbInfo) {
  let sql = '-- =====================================================\n';
  sql += '-- 数据库配置导出\n';
  sql += `-- 导出时间: ${dbInfo.exportTime}\n`;
  sql += `-- 数据库类型: ${dbInfo.type}\n`;
  sql += '-- =====================================================\n\n';

  sql += `-- 数据库信息:\n`;
  sql += `--   类型: ${dbInfo.type}\n`;
  sql += `--   主机: ${dbInfo.host}\n`;
  sql += `--   端口: ${dbInfo.port}\n`;
  sql += `--   数据库名: ${dbInfo.database}\n`;
  sql += `--   字符集: ${dbInfo.charset}\n`;
  sql += '--\n';
  sql += `-- 注意: 敏感信息(用户名、密码等)已脱敏处理\n\n`;

  sql += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

  for (const table of dbInfo.tables) {
    sql += '-- =====================================================\n';
    sql += `-- 表名: ${table.name}\n`;
    sql += `-- 行数: ${table.rowCount}\n`;
    sql += '-- =====================================================\n\n';

    sql += `DROP TABLE IF EXISTS \`${table.name}\`;\n\n`;
    sql += `${table.createStatement};\n\n`;

    if (table.data && table.data.length > 0 && !table.name.includes('users')) {
      const columns = Object.keys(table.data[0]).filter(k => !['password'].includes(k));
      const values = table.data.map(row => {
        const vals = columns.map(col => {
          const val = row[col];
          if (val === null) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          return val;
        });
        return `(${vals.join(', ')})`;
      });

      sql += `INSERT INTO \`${table.name}\` (\`${columns.join('`, `')}\`) VALUES\n`;
      sql += values.join(',\n') + ';\n\n';
    } else if (table.name.includes('users')) {
      sql += '-- 用户表数据已跳过(包含敏感信息)\n\n';
    }
  }

  sql += 'SET FOREIGN_KEY_CHECKS = 1;\n\n';
  sql += '-- =====================================================\n';
  sql += '-- 导出完成\n';
  sql += `-- 导出时间: ${dbInfo.exportTime}\n`;
  sql += '-- =====================================================\n';

  return sql;
}

Date.prototype.format = function(fmt) {
  const o = {
    'yyyy': this.getFullYear(),
    'MM': String(this.getMonth() + 1).padStart(2, '0'),
    'dd': String(this.getDate()).padStart(2, '0'),
    'HH': String(this.getHours()).padStart(2, '0'),
    'mm': String(this.getMinutes()).padStart(2, '0'),
    'ss': String(this.getSeconds()).padStart(2, '0')
  };
  for (const k in o) {
    fmt = fmt.replace(k, o[k]);
  }
  return fmt;
};

app.listen(PORT, async () => {
  console.log(`Dashboard API Server running on http://localhost:${PORT}`);
  const dbConnected = await testConnection();
  if (dbConnected) {
    console.log('✓ MySQL 数据库连接成功');
  } else {
    console.log('✗ MySQL 数据库连接失败，请检查配置');
  }
});
