import mysql from 'mysql2/promise';
import dbConfig from './db.config.js';

let pool = null;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

export const query = async (sql, params = []) => {
  const connection = await getPool().getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    connection.release();
  }
};

export const testConnection = async () => {
  try {
    const connection = await getPool().getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    return false;
  }
};

export const getConnection = async () => {
  return await getPool().getConnection();
};
