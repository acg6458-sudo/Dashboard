const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'dashboard_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export default dbConfig;
