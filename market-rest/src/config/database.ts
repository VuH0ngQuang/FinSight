import mysql from 'mysql2/promise';
import { config } from './env';

export const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
});

export const initDatabase = async (): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log('✅ Connected to MySQL');
  } finally {
    connection.release();
  }
};

