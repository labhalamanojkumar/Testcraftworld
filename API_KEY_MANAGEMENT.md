# API Key Management System

## Overview

The API Key Management system provides a comprehensive solution for generating, managing, and securing API keys for Universal AI model integration and external tools. It includes advanced features like granular permissions, rate limiting, IP whitelisting, and usage tracking.

## Features

### 🔑 Advanced API Key Management
- **Create & Manage**: Generate API keys with custom names and configurations
- **Regenerate**: Securely regenerate keys without losing permissions
- **Deactivate**: Soft-delete keys for audit trail preservation
- **Usage Tracking**: Monitor API call counts and last usage timestamps

### 🛡️ Security & Access Control
- **Granular Permissions**: 13 different permission types across 4 categories
- **IP Whitelisting**: Restrict API key usage to specific IP addresses
- **Expiration Dates**: Set automatic key expiration for temporary access
- **Rate Limiting**: Control usage with hourly request limits
- **Role-Based Access**: Superadmin can manage all keys, users manage their own

### 📊 Monitoring & Analytics
- **Usage Statistics**: Track total API calls per key
- **Last Used Tracking**: Monitor when keys were last accessed
- **Active/Inactive Status**: Visual indicators for key states
- **Usage Overview Dashboard**: Aggregate statistics across all keys

## Permission Categories

### Content Management
- `content:read` - View articles and categories
- `content:write` - Create and edit articles
- `content:delete` - Remove articles and content
- `content:generate` - AI-powered content generation
- `content:analyze` - Content quality analysis

### SEO & Analytics
- `seo:optimize` - Generate SEO metadata
- `analytics:read` - View analytics and insights
- `insights:read` - Access AI-generated insights

### User Management
- `users:read` - View user information
- `users:write` - Create and edit users
- `users:delete` - Remove users

### Administration
- `admin:read` - View admin data
- `admin:write` - Modify admin settings
- `*` - **Full Access (Superadmin)** - Complete read/write access to all resources

## Database Schema

The enhanced `api_keys` table includes:

```sql
CREATE TABLE api_keys (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  key VARCHAR(255) NOT NULL UNIQUE,
  permissions JSON NOT NULL,
  user_id VARCHAR(191) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_used DATETIME,
  
  -- Enhanced fields
  scopes JSON DEFAULT NULL,              -- Custom features/scopes
  rate_limit INT DEFAULT 100,            -- Requests per hour
  allowed_ips JSON DEFAULT NULL,         -- IP whitelist
  expires_at DATETIME DEFAULT NULL,      -- Expiration date
  usage_count INT DEFAULT 0,             -- Total API calls
  metadata JSON DEFAULT NULL,            -- AI model preferences, etc.
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## API Endpoints

### List API Keys
```http
GET /api/admin/api-keys
Authorization: Session-based (must be authenticated)
```

**Response:**
```json
[
  {
    "id": "key_123",
    "name": "ChatGPT Integration",
    "maskedKey": "bkp_abc...xyz",
    "permissions": ["content:read", "content:write"],
    "scopes": { "features": ["auto-publish"] },
    "rateLimit": 100,
    "allowedIps": ["192.168.1.1"],
    "expiresAt": "2024-12-31T23:59:59Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastUsed": "2024-06-15T14:30:00Z",
    "usageCount": 1234,
    "isActive": true
  }
]
```

### Create API Key
```http
POST /api/admin/api-keys
Content-Type: application/json
Authorization: Session-based
```

**Request Body:**
```json
{
  "name": "Content Generator",
  "permissions": ["content:read", "content:write", "content:generate"],
  "rateLimit": 200,
  "allowedIps": ["10.0.0.1", "10.0.0.2"],
  "expiresAt": "2024-12-31",
  "metadata": {
    "aiModel": "gpt-4",
    "purpose": "Blog automation"
  }
}
```

**Response:**
```json
{
  "id": "key_456",
  "key": "bkp_full_key_shown_only_once",
  "name": "Content Generator",
  "permissions": ["content:read", "content:write", "content:generate"]
}
```

### Update API Key
```http
PUT /api/admin/api-keys/:id
Content-Type: application/json
Authorization: Session-based
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "permissions": ["content:read"],
  "rateLimit": 150,
  "allowedIps": ["192.168.1.100"]
}
```

### Regenerate API Key
```http
POST /api/admin/api-keys/:id/regenerate
Authorization: Session-based
```

**Response:**
```json
{
  "id": "key_456",
  "newKey": "bkp_newly_generated_key",
  "message": "API key regenerated successfully"
}
```

### Get Key Statistics
```http
GET /api/admin/api-keys/:id/stats
Authorization: Session-based
```

**Response:**
```json
{
  "id": "key_456",
  "usageCount": 5678,
  "lastUsed": "2024-06-15T18:45:00Z",
  "averageDaily": 189,
  "remainingLimit": 100,
  "daysUntilExpiration": 180
}
```

### Delete/Deactivate API Key
```http
DELETE /api/admin/api-keys/:id
Authorization: Session-based
```

## Using API Keys

### Authentication Header
Include the API key in the `X-API-Key` header:

```bash
curl -X POST http://localhost:3000/api/ai/generate-content \
  -H "X-API-Key: bkp_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "AI in Modern Development",
    "type": "article",
    "keywords": ["AI", "development", "automation"]
  }'
```

### Validation & Security

The API key middleware (`validateApiKey`) performs these checks:
1. **Key existence** - Validates the key exists in the database
2. **Active status** - Ensures the key hasn't been deactivated
3. **Expiration** - Checks if the key has expired
4. **IP whitelist** - Validates request IP against allowed list (if configured)
5. **Rate limiting** - Enforces hourly request limits
6. **Usage tracking** - Increments usage counter on each successful request

## Admin UI Features

### Create API Key Dialog
- **Basic Information**: Name, rate limit, expiration date
- **IP Whitelist**: Comma-separated list of allowed IPs
- **Permissions Matrix**: Checkbox grid organized by category
- **AI Model Config**: Preferred AI model and purpose notes
- **Select All**: Quick permission presets

### API Keys Table
- **Name & Masked Key**: Display key details with copy button
- **Permissions Badges**: Visual permission indicators
- **Usage Stats**: Call count and rate limit display
- **Last Used**: Timestamp of most recent API call
- **Status Badge**: Active/Inactive visual indicator
- **Actions**: Regenerate and deactivate buttons

### Usage Overview Dashboard
- **Total Keys**: Count of all API keys
- **Active Keys**: Count of active keys only
- **Total API Calls**: Aggregate usage across all keys

## Migration

Run the database migration to add enhanced fields:

```bash
# Using MySQL client
mysql -u root -p your_database < migrations/0003_enhance_api_keys.sql

# Or using a migration tool
npm run migrate
```

## Best Practices

### Security
1. **Never share API keys** - Each integration should have its own key
2. **Use IP whitelisting** - Restrict keys to known server IPs when possible
3. **Set expiration dates** - Use temporary keys for short-term integrations
4. **Principle of least privilege** - Grant only necessary permissions
5. **Regular rotation** - Regenerate keys periodically for security

### Rate Limiting
- Default: 100 requests/hour (suitable for most use cases)
- High-volume: 500-1000 requests/hour (for automation tools)
- Testing: 50 requests/hour (for development/testing keys)

### Permission Sets

**Read-Only Access:**
```json
["content:read", "analytics:read", "insights:read"]
```

**Content Editor:**
```json
["content:read", "content:write", "seo:optimize"]
```

**AI Assistant (Full):**
```json
["content:read", "content:write", "content:generate", "content:analyze", "seo:optimize"]
```

**Superadmin:**
```json
["*"]
```

## Troubleshooting

### "API key not found or inactive"
- Check if the key has been deactivated
- Verify you're using the correct key string
- Ensure the key hasn't expired

### "Rate limit exceeded"
- Wait until the next hour window
- Increase the rate limit for the key
- Consider using multiple keys for load distribution

### "IP address not allowed"
- Add your server IP to the allowed list
- Remove IP whitelist for development environments
- Check if you're behind a proxy (use X-Forwarded-For header)

### "Insufficient permissions"
- Verify the required permission is granted
- Check if using a wildcard `*` permission for superadmin access
- Update the key's permissions via the admin UI

## Future Enhancements

- [ ] Webhook notifications for usage thresholds
- [ ] API key usage analytics charts
- [ ] Permission templates/presets
- [ ] Automatic key rotation policies
- [ ] Audit logs for API key actions
- [ ] API key scoping by resource (e.g., specific categories only)
- [ ] OAuth 2.0 integration for third-party apps

## Support

For questions or issues with the API Key Management system, please:
1. Check this documentation
2. Review the API endpoint examples
3. Test with the Swagger UI at `/api-docs`
4. Contact support with specific error messages
