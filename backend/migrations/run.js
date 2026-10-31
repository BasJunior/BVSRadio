const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dbConfig = require('../config/database');

async function run() {
    const pool = new Pool(dbConfig);
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(100) PRIMARY KEY,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const appliedResult = await client.query('SELECT version FROM schema_migrations');
        const applied = new Set(appliedResult.rows.map((row) => row.version));

        if (!applied.has('001_initial_schema.sql')) {
            const schemaPath = path.join(__dirname, '..', 'models', 'schema.sql');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            await client.query('BEGIN');
            try {
                await client.query(schemaSql);
                await client.query('INSERT INTO schema_migrations(version) VALUES ($1)', ['001_initial_schema.sql']);
                await client.query('COMMIT');
                console.log('Applied 001_initial_schema.sql');
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
        }

        const migrationFiles = fs.readdirSync(__dirname)
            .filter((name) => /^\d+_.*\.sql$/.test(name) && name !== '001_initial_schema.sql')
            .sort();

        for (const file of migrationFiles) {
            if (applied.has(file)) continue;
            const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query('INSERT INTO schema_migrations(version) VALUES ($1)', [file]);
                await client.query('COMMIT');
                console.log(`Applied ${file}`);
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
        }
    } finally {
        client.release();
        await pool.end();
    }
}

run().catch((error) => {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
});
