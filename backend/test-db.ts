import pool from './src/utils/db';

async function test() {
  try {
    console.log('✅ Testing Database connection...');
    const [rows]: any = await pool.query('SELECT NOW() as currentTime');
    console.log('✅ Database connected successfully');
    console.log('Current Database time:', rows[0].currentTime);

  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    pool.end();
  }
}

test();