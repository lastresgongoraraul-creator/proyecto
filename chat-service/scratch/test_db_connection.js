require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

console.log('Testing DB Connection with URL:', process.env.DATABASE_URL);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runTest() {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL');
        
        // Test query
        const res = await client.query('SELECT NOW()');
        console.log('Query result:', res.rows[0]);
        
        // Check chat_messages table
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'chat_messages'
            );
        `);
        console.log('Table chat_messages exists:', tableCheck.rows[0].exists);

        // Check users table
        const userCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'users'
            );
        `);
        console.log('Table users exists:', userCheck.rows[0].exists);

        client.release();
    } catch (err) {
        console.error('Test failed:', err.message);
    } finally {
        await pool.end();
    }
}

runTest();
