# API Key Feature Testing Checklist

## ✅ Database Migration
- [x] Added missing columns to api_keys table
- [x] Columns added: scopes, rate_limit, allowed_ips, expires_at, usage_count, metadata
- [x] Indexes created for performance

## 🔧 Backend Fixes Applied

### 1. Database Schema ✅
- Fixed column types (TEXT instead of JSON for MySQL compatibility)
- Added all required fields: scopes, rateLimit, allowedIps, expiresAt, usageCount, metadata
- Fixed column names (created_by instead of user_id)

### 2. API Endpoints ✅
- `GET /api/admin/api-keys` - List all API keys (admin/superadmin only)
- `POST /api/admin/api-keys` - Create new API key
- `DELETE /api/admin/api-keys/:id` - Soft delete (deactivate)
- `DELETE /api/admin/api-keys/:id?permanent=true` - Hard delete (remove from DB)
- `POST /api/admin/api-keys/:id/regenerate` - Regenerate key string
- `PUT /api/admin/api-keys/:id` - Update key properties
- `GET /api/admin/api-keys/:id/stats` - Get usage statistics

### 3. Authentication & Permissions ✅
- Session-based authentication for admin routes
- API key validation middleware (validateApiKey)
- IP whitelist checking
- Rate limiting (usage count tracking)
- Expiration date validation
- Permission-based access control

### 4. Frontend Fixes ✅
- Added `credentials: "include"` to all fetch calls for session cookies
- Fixed permanent delete to use query parameter approach
- Fixed TypeScript type error (Number() conversion)
- Enhanced error handling with detailed logging

## 🧪 Testing Steps

### Test 1: Create API Key
1. Navigate to Admin panel (must be logged in as admin/superadmin)
2. Click "Create New API Key"
3. Fill in:
   - Name: "Test Universal AI Key"
   - Permissions: Select "Full Access (Superadmin)" or specific permissions
   - AI Model Configuration: "Any AI Model (Universal)" (optional)
   - Rate Limit: 100 (default)
   - Allowed IPs: Leave empty or add specific IPs
   - Expiration: Leave empty for no expiration
4. Click "Create Key"
5. **Expected**: Success toast, new key displayed with full key string (copy it!)

### Test 2: List API Keys
1. Refresh the page or navigate back to API Keys tab
2. **Expected**: See all created keys with masked versions (e.g., "bkp_xxxx...")
3. **Expected**: See metadata: permissions, rate limit, usage count, status

### Test 3: Deactivate API Key (Soft Delete)
1. Click the Ban icon on a test key
2. Confirm deactivation
3. **Expected**: Success toast, key marked as inactive (badge should change)

### Test 4: Permanently Delete API Key (Hard Delete)
1. Click the Trash icon on a test key
2. Confirm permanent deletion
3. **Expected**: Success toast, key removed from list completely

### Test 5: Regenerate API Key
1. Click the refresh icon on an active key
2. Confirm regeneration
3. **Expected**: New key string generated, usage count reset to 0

### Test 6: Use API Key for AI Operations
1. Copy an active API key
2. Make API call with header: `X-API-Key: your_key_here`
3. Test endpoints:
   - `POST /api/ai/generate-content` - Generate content
   - `POST /api/ai/analyze-content` - Analyze content
   - `GET /api/ai/insights` - Get insights
   - `POST /api/ai/optimize-seo` - SEO optimization
4. **Expected**: Successful responses, usage count increments

### Test 7: Rate Limiting
1. Create a key with low rate limit (e.g., 5)
2. Make multiple API calls
3. **Expected**: After limit exceeded, get 429 error

### Test 8: IP Whitelist
1. Create a key with specific allowed IPs
2. Make API call from different IP
3. **Expected**: 403 Forbidden error

### Test 9: Expiration
1. Create a key with past expiration date
2. Try to use the key
3. **Expected**: 401 Unauthorized with "API key has expired" message

### Test 10: Permissions
1. Create a key with limited permissions (e.g., only "content:read")
2. Try to use write operations
3. **Expected**: Permission denied errors

## 🐛 Known Issues (Fixed)

### Issue 1: Missing Database Columns ✅ FIXED
**Error**: `Unknown column 'scopes' in 'field list'`
**Fix**: Ran migration script to add all missing columns

### Issue 2: Delete Not Working ✅ FIXED
**Error**: `Unexpected token '<', DOCTYPE... is not valid JSON`
**Fix**: Changed to query parameter approach (?permanent=true)

### Issue 3: Auto Logout on Refresh ✅ FIXED
**Error**: Session not persisting
**Fix**: Added credentials: "include" to all fetch calls

### Issue 4: TypeScript Error ✅ FIXED
**Error**: `Argument of type 'string' is not assignable to parameter of type 'number'`
**Fix**: Convert key.id to Number() before passing to mutation

### Issue 5: Array.isArray Error ✅ FIXED
**Error**: `key.permissions.slice(...).map is not a function`
**Fix**: Added Array.isArray() checks before .map()

## 📊 Verification Checklist

- [x] Database migration successful
- [x] All columns exist in api_keys table
- [x] Server starts without errors
- [x] No TypeScript compilation errors
- [x] All API routes registered correctly
- [x] Session authentication working
- [ ] Can create API keys (TEST REQUIRED)
- [ ] Can list API keys (TEST REQUIRED)
- [ ] Can deactivate API keys (TEST REQUIRED)
- [ ] Can permanently delete API keys (TEST REQUIRED)
- [ ] Can regenerate API keys (TEST REQUIRED)
- [ ] API key validation works (TEST REQUIRED)
- [ ] Rate limiting works (TEST REQUIRED)
- [ ] IP whitelist works (TEST REQUIRED)
- [ ] Expiration works (TEST REQUIRED)

## 🎯 Next Steps

1. **Manual Testing**: Follow the testing steps above
2. **Monitor Logs**: Check browser console and server logs for any errors
3. **Performance**: Test with multiple keys and concurrent requests
4. **Security**: Verify IP whitelisting and rate limiting work correctly
5. **Documentation**: Update API documentation with examples

## 📝 API Key Format

```
bkp_[32 hexadecimal characters]
Example: bkp_0e5dedc57b3a45d38ae72385e44e3449
```

## 🔐 Security Features

1. **Session-based admin authentication** - Only admin/superadmin can manage keys
2. **API key validation** - Keys validated on every request
3. **IP whitelisting** - Restrict keys to specific IP addresses
4. **Rate limiting** - Prevent abuse with usage limits
5. **Expiration dates** - Auto-expire keys after specified date
6. **Permission system** - Granular control over API capabilities
7. **Usage tracking** - Monitor key usage and last used timestamp
8. **Soft delete** - Deactivate keys instead of deleting (preserves history)
9. **Hard delete** - Permanently remove unwanted keys

## 🚀 Universal AI Support

The API key system supports:
- **Any AI Model** - Keys can work with any AI provider
- **Custom Scopes** - Define specific features/resources
- **Metadata Storage** - Store AI model preferences, notes, etc.
- **Flexible Permissions** - 13 different permission types across 4 categories
- **Superadmin Access** - Full wildcard (*) permission for complete access
