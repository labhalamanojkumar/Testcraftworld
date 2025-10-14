import mysql from 'mysql2/promise';
import { URL } from 'url';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');

  const url = new URL(DATABASE_URL);

  // Extract connection parameters
  const config = {
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading slash
    connectTimeout: 10000,
    acquireTimeout: 10000,
    timeout: 10000,
  };

  // Check SSL mode from URL
  const sslMode = (url.searchParams.get('ssl-mode') || url.searchParams.get('sslmode') || '').toLowerCase();
  const useSsl = sslMode === 'required' || sslMode === 'verify_ca' || sslMode === 'verify_identity';

  if (useSsl) {
    config.ssl = { rejectUnauthorized: false };
    console.log('🔒 SSL mode: REQUIRED (rejectUnauthorized: false)');
  } else {
    console.log('🔓 SSL mode: DISABLED');
  }

  console.log(`📍 Host: ${config.host}:${config.port}`);
  console.log(`👤 User: ${config.user}`);
  console.log(`📊 Database: ${config.database}\n`);

  let pool;

  try {
    // Test 1: Basic TCP connectivity
    console.log('1️⃣ Testing TCP connectivity...');
    const net = await import('net');
    const tcpPromise = new Promise((resolve, reject) => {
      const socket = net.createConnection({
        host: config.host,
        port: config.port,
        timeout: 5000
      });

      socket.on('connect', () => {
        socket.end();
        resolve(true);
      });

      socket.on('error', (err) => {
        reject(err);
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('TCP connection timeout'));
      });
    });

    await tcpPromise;
    console.log('✅ TCP connection successful\n');

    // Test 2: MySQL connection without SSL first
    console.log('2️⃣ Testing MySQL connection (no SSL)...');
    const noSslConfig = { ...config };
    delete noSslConfig.ssl;

    try {
      const noSslPool = mysql.createPool(noSslConfig);
      const noSslConn = await noSslPool.getConnection();
      await noSslConn.ping();
      noSslConn.release();
      await noSslPool.end();
      console.log('✅ MySQL connection successful (no SSL)\n');
    } catch (noSslError) {
      console.log('⚠️  MySQL connection failed without SSL:', noSslError.message);
      if (useSsl) {
        console.log('   (This is expected if SSL is required)\n');
      } else {
        console.log('   (This indicates a non-SSL issue)\n');
      }
    }

    // Test 3: MySQL connection with SSL (if required)
    if (useSsl) {
      console.log('3️⃣ Testing MySQL connection (with SSL)...');
      pool = mysql.createPool(config);

      const conn = await pool.getConnection();
      await conn.ping();
      console.log('✅ MySQL connection successful (with SSL)\n');

      // Test 4: Query the database
      console.log('4️⃣ Testing database queries...');
      const [tables] = await conn.execute('SHOW TABLES');
      console.log(`📋 Found ${tables.length} tables in database`);

      // Check for required tables
      const requiredTables = ['articles', 'categories', 'users'];
      const existingTables = tables.map(row => Object.values(row)[0]);

      console.log('📊 Tables found:', existingTables.join(', '));

      for (const table of requiredTables) {
        if (existingTables.includes(table)) {
          console.log(`✅ Table '${table}' exists`);

          // Check if table has data
          const [rows] = await conn.execute(`SELECT COUNT(*) as count FROM ${table}`);
          const count = rows[0].count;
          console.log(`   📈 Records in '${table}': ${count}`);
        } else {
          console.log(`❌ Table '${table}' missing`);
        }
      }

      conn.release();
      console.log('\n✅ All database tests passed!');
    }

  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔐 Authentication failed - check username/password');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n📊 Database does not exist - check database name');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n🌐 Connection refused - check host/port and firewall');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n⏰ Connection timeout - check network connectivity');
    } else if (error.message.includes('Plugin')) {
      console.error('\n🔌 Authentication plugin issue - server/client mismatch');
      console.error('💡 Solution: Change user to use caching_sha2_password');
    } else if (error.message.includes('SSL')) {
      console.error('\n🔒 SSL connection failed - check SSL configuration');
    }

    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Verify DATABASE_URL is correct');
    console.error('2. Check if MySQL server is running and accessible');
    console.error('3. Ensure SSL mode matches server requirements');
    console.error('4. Try changing user authentication plugin to caching_sha2_password');

    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

testDatabaseConnection().catch(console.error);