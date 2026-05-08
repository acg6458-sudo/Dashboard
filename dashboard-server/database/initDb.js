import mysql from 'mysql2/promise';
import dbConfig from './db.config.js';

const createDatabaseSQL = `
CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
`;

const createTablesSQL = `
USE ${dbConfig.database};

DROP TABLE IF EXISTS devices;
CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '设备名称',
    type VARCHAR(50) NOT NULL COMMENT '设备类型: server/firewall/switch',
    ip VARCHAR(50) NOT NULL COMMENT 'IP地址',
    status VARCHAR(20) DEFAULT 'offline' COMMENT '状态: online/warning/offline',
    cpu INT DEFAULT 0 COMMENT 'CPU使用率',
    memory INT DEFAULT 0 COMMENT '内存使用率',
    uptime VARCHAR(50) DEFAULT '0天 0小时' COMMENT '运行时间',
    last_check DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '最后检查时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备表';

DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码(加密存储)',
    email VARCHAR(100) NOT NULL COMMENT '邮箱',
    role VARCHAR(20) DEFAULT 'Viewer' COMMENT '角色: Administrator/Operator/Viewer',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态: active/inactive',
    last_login DATETIME DEFAULT NULL COMMENT '最后登录时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
`;

const insertDataSQL = `
USE ${dbConfig.database};

INSERT INTO devices (name, type, ip, status, cpu, memory, uptime) VALUES
('Web Server 01', 'server', '192.168.1.10', 'online', 45, 62, '15天 8小时'),
('Database Server', 'server', '192.168.1.11', 'online', 78, 85, '30天 2小时'),
('Firewall Primary', 'firewall', '192.168.1.1', 'online', 23, 45, '90天 15小时'),
('Firewall Backup', 'firewall', '192.168.1.2', 'warning', 35, 67, '45天 6小时'),
('Core Switch 01', 'switch', '192.168.1.5', 'online', 12, 34, '120天 4小时'),
('Access Switch 02', 'switch', '192.168.1.6', 'offline', 0, 0, '0天 0小时');

INSERT INTO users (username, password, email, role, status) VALUES
('admin', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36DnWV53K/Qv/5VQZQZQZQZQ', 'admin@example.com', 'Administrator', 'active'),
('operator01', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36DnWV53K/Qv/5VQZQZQZQZQ', 'operator01@example.com', 'Operator', 'active'),
('viewer01', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36DnWV53K/Qv/5VQZQZQZQZQ', 'viewer01@example.com', 'Viewer', 'active'),
('operator02', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36DnWV53K/Qv/5VQZQZQZQZQ', 'operator02@example.com', 'Operator', 'inactive');
`;

async function initDatabase() {
  let connection;
  try {
    const initConfig = {
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true
    };
    
    console.log('正在连接 MySQL...');
    connection = await mysql.createConnection(initConfig);
    console.log('✓ MySQL 连接成功');

    console.log('正在创建数据库...');
    await connection.query(createDatabaseSQL);
    console.log(`✓ 数据库 ${dbConfig.database} 创建成功`);

    console.log('正在创建表...');
    await connection.query(createTablesSQL);
    console.log('✓ 表创建成功');

    console.log('正在插入初始数据...');
    await connection.query(insertDataSQL);
    console.log('✓ 数据插入成功');

    console.log('\n✅ 数据库初始化完成！');
    console.log('提示：admin 用户的密码是 admin123');

  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
