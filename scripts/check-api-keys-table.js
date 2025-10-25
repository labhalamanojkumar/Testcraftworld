import mysql from 'mysql2/promise';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function checkAndMigrateApiKeys() {
  console.log('🔍 Checking api_keys table structure...\n');

  const url = new URL(DATABASE_URL);

  const config = {
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    multipleStatements: true,
  };

  const sslMode = (url.searchParams.get('ssl-mode') || url.searchParams.get('sslmode') || '').toLowerCase();
  const useSsl = sslMode === 'required' || sslMode === 'verify_ca' || sslMode === 'verify_identity';

  if (useSsl) {
    config.ssl = { rejectUnauthorized: false };
  }

  let connection;

  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database\n');

    // Check table structure
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'api_keys'",
      [config.database]
    );

    console.log('📋 Current columns in api_keys table:');
    const columnNames = columns.map(col => col.COLUMN_NAME);
    console.log(columnNames.join(', '));
    console.log('');

    // Check if new columns exist
    const requiredColumns = ['scopes', 'rate_limit', 'allowed_ips', 'expires_at', 'usage_count', 'metadata'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));

    if (missingColumns.length > 0) {
      console.log('⚠️  Missing columns:', missingColumns.join(', '));
      console.log('🔧 Running migration...\n');

      // Read migration file
      const migrationPath = path.join(process.cwd(), 'migrations', '0003_enhance_api_keys.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

      // Fix the migration SQL - change user_id to created_by and JSON to TEXT
      const fixedSQL = migrationSQL
        .replace(/`user_id`/g, '`created_by`')
        .replace(/JSON/g, 'TEXT')
        .replace(/ADD COLUMN `scopes`[^,]+,/g, "ADD COLUMN `scopes` TEXT DEFAULT NULL COMMENT 'Custom scopes/features enabled for this key',")
        .replace(/ADD COLUMN `allowed_ips`[^,]+,/g, "ADD COLUMN `allowed_ips` TEXT DEFAULT NULL COMMENT 'Array of whitelisted IP addresses',")
        .replace(/ADD COLUMN `metadata`[^;]+;/g, "ADD COLUMN `metadata` TEXT DEFAULT NULL COMMENT 'Additional metadata (AI model preferences, etc.)';");

      // Execute migration
      await connection.query(fixedSQL);
      console.log('✅ Migration completed successfully!\n');

      // Verify columns were added
      const [newColumns] = await connection.execute(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'api_keys'",
        [config.database]
      );
      const newColumnNames = newColumns.map(col => col.COLUMN_NAME);
      console.log('📋 Updated columns:', newColumnNames.join(', '));
    } else {
      console.log('✅ All required columns exist!');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAndMigrateApiKeys().catch(console.error);
