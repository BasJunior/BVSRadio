// Database configuration
require('dotenv').config();

const useSsl = ['1', 'true', 'yes'].includes(String(process.env.DB_SSL || '').toLowerCase());

module.exports = {
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'bvsradio',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: Number.parseInt(process.env.DB_POOL_MAX || '20', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 15000,
    query_timeout: 15000,
    ssl: useSsl ? { rejectUnauthorized: true } : false
};
