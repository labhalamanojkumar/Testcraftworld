# API Key Management - User Guide

## For Superadmin Users

### What is a Superadmin?
A superadmin has **complete read and write permissions** to the entire blog platform. They can:
- Create API keys for themselves and other users
- View and manage **ALL API keys** in the system
- Grant any permission level, including the wildcard `*` permission
- Monitor usage across all API keys

### Creating an API Key with Full Access

1. **Login to Admin Panel**
   - Navigate to: `http://localhost:5000/admin`
   - Login with superadmin credentials
   - Click on the **"API"** tab

2. **Create New API Key**
   - Click the **"Create API Key"** button
   - Fill in the key details:
     ```
     Name: Universal AI Assistant
     Rate Limit: 1000 (requests per hour)
     Expiration: 2024-12-31 (or leave empty for no expiration)
     Allowed IPs: (leave empty for any IP, or add specific IPs)
     ```

3. **Grant Full Permissions (Superadmin Access)**
   - Scroll to the **Administration** section
   - Check the **"Full Access (Superadmin)"** checkbox (`*` permission)
   - This grants complete read/write access to all resources

4. **Configure AI Model Preferences** (Optional)
   - Select preferred AI model: GPT-4, Claude 3, Gemini Pro, etc.
   - Add purpose/notes: "Universal AI integration for blog automation"

5. **Create and Copy the Key**
   - Click **"Create API Key"**
   - **IMPORTANT:** Copy the full key immediately (shown only once!)
   - Store it securely (password manager, environment variable, etc.)

### Example: Full Superadmin API Key

```json
{
  "name": "Universal AI Assistant",
  "permissions": ["*"],
  "rateLimit": 1000,
  "allowedIps": null,
  "expiresAt": null,
  "metadata": {
    "aiModel": "gpt-4",
    "purpose": "Universal AI support with full access"
  }
}
```

This key can:
- ✅ Read all content
- ✅ Write/create articles
- ✅ Delete content
- ✅ Generate AI content
- ✅ Analyze content quality
- ✅ Optimize SEO
- ✅ Read analytics and insights
- ✅ Manage users
- ✅ Access admin settings
- ✅ **Everything else** (wildcard permission)

### Managing API Keys

As a superadmin, you can:

#### View All Keys
- See keys created by all users
- Filter by status (active/inactive)
- Sort by usage, creation date, etc.

#### Update Existing Keys
- Change permissions
- Adjust rate limits
- Add/remove IP whitelist
- Update expiration dates

#### Regenerate Keys
- Create a new key string for security
- Maintains all permissions and settings
- Resets usage counter to 0
- Old key becomes invalid immediately

#### Deactivate Keys
- Soft-delete for audit trail
- Key remains in database but cannot be used
- Can be reactivated if needed

#### Monitor Usage
- View total API calls per key
- Check last usage timestamp
- See aggregate statistics across all keys
- Identify unused or overused keys

### Advanced Use Cases

#### 1. Content Automation Pipeline
```bash
# Use the API key to generate and publish content automatically
curl -X POST http://localhost:3000/api/ai/generate-content \
  -H "X-API-Key: bkp_superadmin_full_access_key" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Latest Tech Trends 2024",
    "type": "article",
    "categoryId": "tech",
    "autoPublish": true,
    "seoOptimize": true
  }'
```

#### 2. Bulk Content Analysis
```bash
# Analyze all articles for SEO improvements
curl -X POST http://localhost:3000/api/ai/bulk-analyze \
  -H "X-API-Key: bkp_superadmin_full_access_key" \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "all_articles",
    "analysis_types": ["seo", "readability", "engagement"]
  }'
```

#### 3. User Management
```bash
# Manage users programmatically
curl -X GET http://localhost:3000/api/admin/users \
  -H "X-API-Key: bkp_superadmin_full_access_key"
```

---

## For Regular Users

### What Can Regular Users Do?
Regular users (non-admin) have limited API key capabilities:
- Create API keys for **their own use only**
- View and manage **only their own keys**
- Cannot grant admin or superadmin permissions
- Cannot see other users' API keys

### Creating Your API Key

1. **Login to Your Account**
   - Navigate to your profile or dashboard
   - Access the API settings section

2. **Create API Key with Your Permissions**
   - Click **"Create API Key"**
   - Choose from available permissions:
     - ✅ Content: read, write (your own articles)
     - ✅ SEO: optimize your content
     - ✅ Analytics: view your stats
     - ❌ Admin: read/write (not available)
     - ❌ Users: manage (not available)

### Example: User API Key (Content Creator)

```json
{
  "name": "My Content Assistant",
  "permissions": [
    "content:read",
    "content:write",
    "content:generate",
    "seo:optimize"
  ],
  "rateLimit": 100,
  "metadata": {
    "aiModel": "gpt-3.5-turbo",
    "purpose": "Personal blog writing assistant"
  }
}
```

This key can:
- ✅ Read your articles
- ✅ Create/edit your articles
- ✅ Generate content with AI
- ✅ Optimize SEO for your posts
- ❌ Delete articles
- ❌ Manage other users
- ❌ Access admin features

### Usage Examples for Regular Users

#### Generate Blog Post
```bash
curl -X POST http://localhost:3000/api/ai/generate-content \
  -H "X-API-Key: bkp_user_content_creator_key" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "My Favorite Recipes",
    "type": "article",
    "keywords": ["cooking", "recipes", "food"]
  }'
```

#### Optimize SEO
```bash
curl -X POST http://localhost:3000/api/ai/optimize-seo \
  -H "X-API-Key: bkp_user_content_creator_key" \
  -H "Content-Type: application/json" \
  -d '{
    "articleId": "article_123",
    "focusKeyword": "healthy recipes"
  }'
```

---

## Permission Levels Comparison

| Feature | Regular User | Admin | Superadmin |
|---------|--------------|-------|------------|
| View own keys | ✅ | ✅ | ✅ |
| View all keys | ❌ | ✅ | ✅ |
| Create keys | ✅ (limited) | ✅ | ✅ |
| Grant `*` permission | ❌ | ❌ | ✅ |
| Manage all keys | ❌ | ✅ | ✅ |
| Read own content | ✅ | ✅ | ✅ |
| Write own content | ✅ | ✅ | ✅ |
| Read all content | ❌ | ✅ | ✅ |
| Delete any content | ❌ | ✅ | ✅ |
| Manage users | ❌ | ✅ | ✅ |
| Admin settings | ❌ | ⚠️ (limited) | ✅ |

---

## Best Practices

### Security
1. **Never share API keys** - Each tool/integration should have its own
2. **Use minimum permissions** - Only grant what's needed
3. **Set expiration dates** - For temporary integrations
4. **Rotate keys regularly** - Regenerate every 90 days for security
5. **Monitor usage** - Check for unusual activity

### Organization
1. **Name keys descriptively** - "ChatGPT Integration", "Content Generator"
2. **Add purpose notes** - Document what each key is for
3. **Deactivate unused keys** - Clean up old/forgotten keys
4. **Use IP whitelist for servers** - Lock down production keys

### Rate Limits
- **Development/Testing:** 50 requests/hour
- **Personal Use:** 100 requests/hour
- **Production Tools:** 500-1000 requests/hour
- **High-Volume APIs:** Custom (contact admin)

---

## API Key Format

All API keys use the format: `bkp_` + random string

Example: `bkp_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

- **bkp_** = Prefix (Blog Platform)
- **Random string** = Secure token (32+ characters)

---

## Troubleshooting

### "API key not found or inactive"
**Solution:** Check if your key has been deactivated or expired. Create a new one if needed.

### "Insufficient permissions"
**Solution:** Your key doesn't have the required permission. Update the key or contact admin for access.

### "Rate limit exceeded"
**Solution:** You've made too many requests. Wait until the next hour or increase your rate limit.

### "IP address not allowed"
**Solution:** Your IP is not whitelisted. Remove the IP restriction or add your current IP.

---

## Support

### For Regular Users
- Contact support with questions about your API keys
- Request permission increases through your account manager
- Report issues or bugs via the help desk

### For Superadmins
- Full access to all system features
- Can create support tickets for users
- Access to API analytics and monitoring tools
- Direct line to technical support for integrations

---

## Quick Reference

### Superadmin Quick Start
```bash
# 1. Create API key with full access
# 2. Use the wildcard (*) permission
# 3. Set high rate limit (1000+)
# 4. No IP restrictions for flexibility
# 5. Copy and store key securely
# 6. Start using all API endpoints
```

### Regular User Quick Start
```bash
# 1. Create API key with content permissions
# 2. Select specific permissions needed
# 3. Use default rate limit (100)
# 4. Copy and store key securely
# 5. Use for personal content automation
```

---

**🎉 Happy API Key Management! If you need help, consult the full documentation in `API_KEY_MANAGEMENT.md`**
