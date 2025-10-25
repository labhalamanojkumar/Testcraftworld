#!/bin/bash

# API Key Management - Setup Script
# This script runs the database migration and verifies the setup

echo "🔑 API Key Management System - Setup"
echo "===================================="
echo ""

# Check if database credentials are provided
DB_USER=${DB_USER:-"root"}
DB_PASSWORD=${DB_PASSWORD:-""}
DB_NAME=${DB_NAME:-"blog_platform"}

echo "📋 Configuration:"
echo "  Database User: $DB_USER"
echo "  Database Name: $DB_NAME"
echo ""

# Run the migration
echo "🚀 Running database migration..."
echo ""

if [ -z "$DB_PASSWORD" ]; then
  mysql -u "$DB_USER" "$DB_NAME" < migrations/0003_enhance_api_keys.sql
else
  mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < migrations/0003_enhance_api_keys.sql
fi

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migration completed successfully!"
  echo ""
  echo "📊 Next Steps:"
  echo "  1. Start the development server: npm run dev"
  echo "  2. Login to Admin panel: http://localhost:5000/admin"
  echo "  3. Navigate to the 'API' tab"
  echo "  4. Create your first API key"
  echo ""
  echo "📖 Documentation:"
  echo "  - Feature Guide: API_KEY_MANAGEMENT.md"
  echo "  - Implementation: API_KEY_IMPLEMENTATION_SUMMARY.md"
  echo ""
else
  echo ""
  echo "❌ Migration failed!"
  echo ""
  echo "🔧 Troubleshooting:"
  echo "  1. Verify MySQL is running"
  echo "  2. Check database credentials"
  echo "  3. Ensure database exists: CREATE DATABASE $DB_NAME;"
  echo "  4. Run migration manually:"
  echo "     mysql -u $DB_USER -p $DB_NAME < migrations/0003_enhance_api_keys.sql"
  echo ""
  exit 1
fi

# Verify the migration
echo "🔍 Verifying migration..."
echo ""

COLUMN_CHECK=$(mysql -u "$DB_USER" ${DB_PASSWORD:+-p"$DB_PASSWORD"} "$DB_NAME" -e "SHOW COLUMNS FROM api_keys LIKE 'scopes';" --batch --skip-column-names)

if [ -n "$COLUMN_CHECK" ]; then
  echo "✅ Migration verified: Enhanced columns added successfully"
  echo ""
  
  echo "📋 New API Key Features Available:"
  echo "  ✓ Granular permissions (13 types)"
  echo "  ✓ Rate limiting (hourly)"
  echo "  ✓ IP whitelisting"
  echo "  ✓ Expiration dates"
  echo "  ✓ Usage tracking"
  echo "  ✓ AI model preferences"
  echo ""
else
  echo "⚠️  Warning: Could not verify migration"
  echo "   Please check the database manually"
  echo ""
fi

echo "🎉 Setup complete! Your API Key Management system is ready."
echo ""
