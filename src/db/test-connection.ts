import 'dotenv/config';
import { Client } from 'pg';

console.log('DATABASE_URL =', process.env.DATABASE_URL);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Connection successful');
  } catch (err) {
    console.error('❌ Connection failed:', err);
  } finally {
    await client.end();
  }
}

testConnection();
