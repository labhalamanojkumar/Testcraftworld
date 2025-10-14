# Coolify Deployment Guide for BlogStreamPro

This guide will help you deploy BlogStreamPro to Coolify VPS.

## Prerequisites

- Coolify instance running
- GitHub repository access
- MySQL database (can be provisioned through Coolify)

## Deployment Steps

### 1. Prepare Your Repository

Ensure your repository has the following files:
- `Dockerfile` - Container configuration
- `coolify.json` - Coolify service configuration
- `.env.example` - Environment variables template

### 2. Set Up Database

1. In Coolify, create a new MySQL database service
2. Note the database credentials and connection URL

### 3. Configure Environment Variables

In Coolify, set the following environment variables for your application:

```bash
# Database
DATABASE_URL=mysql://username:password@mysql_container:3306/database?ssl-mode=REQUIRED

# Application
NODE_ENV=production
PORT=${{PORT}}  # This will be set automatically by Coolify

# Security
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Admin Credentials (optional - defaults will be used if not set)
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=securepassword123
```

### 4. Deploy the Application

1. In Coolify, create a new application
2. Connect to your GitHub repository
3. Select the main branch
4. Enable auto-deploy (recommended)
5. The application will build using Docker and deploy automatically

### 5. Access Your Application

Once deployed, Coolify will provide a domain for your application. You can access:

- **Main Application**: `https://your-domain.coolify.io`
- **Admin Panel**: `https://your-domain.coolify.io/admin`
- **Health Check**: `https://your-domain.coolify.io/health`

## Default Credentials

- **Super Admin**:
  - Username: `superadmin`
  - Password: `securepassword123`

## Troubleshooting

### Database Connection Issues
- Ensure the DATABASE_URL is correctly formatted
- Verify SSL mode is set to REQUIRED for Coolify databases
- Check that the database service is running

### Build Failures
- Check the build logs in Coolify
- Ensure all dependencies are properly listed in package.json
- Verify the Dockerfile is correct

### Health Check Failures
- The application uses `/health` endpoint for health checks
- Ensure the PORT environment variable is properly configured
- Check server logs for startup errors

## File Structure

```
/app
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types/schemas
├── dist/            # Built application (generated)
├── uploads/         # User uploaded files
├── package.json     # Dependencies and scripts
├── Dockerfile       # Container configuration
└── coolify.json     # Coolify service config
```

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | MySQL connection string | Yes | - |
| `PORT` | Server port | Yes | 3000 |
| `NODE_ENV` | Environment mode | Yes | production |
| `SESSION_SECRET` | Session encryption key | Yes | - |
| `SUPER_ADMIN_USERNAME` | Admin username | No | superadmin |
| `SUPER_ADMIN_PASSWORD` | Admin password | No | securepassword123 |

## Support

If you encounter issues:
1. Check Coolify logs
2. Verify environment variables
3. Ensure database connectivity
4. Review the application logs</content>
<parameter name="filePath">/Users/manojkumar/Desktop/Work flow/BlogStreamPro/COOLIFY_DEPLOYMENT.md