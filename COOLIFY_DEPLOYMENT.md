# Coolify Deployment Guide for BlogStreamPro

This guide will help you deploy BlogStreamPro to Coolify VPS.

## Prerequisites

- Coolify instance running
- GitHub repository access (https://github.com/labhalamanojkumar/Testcraft)
- MySQL database (can be provisioned through Coolify)

## Quick Deployment Steps

### 1. Deploy via Coolify

1. In Coolify, create a new application
2. Connect to GitHub repository: `labhalamanojkumar/Testcraft`
3. Select the `main` branch
4. Enable auto-deploy (recommended)
5. The application will build using Docker and deploy automatically

### 2. Configure Environment Variables

In Coolify, set the following environment variables for your application:

```bash
# Database (Required)
DATABASE_URL=mysql://username:password@mysql_container:3306/database?ssl-mode=REQUIRED

# Application (Auto-configured by Coolify)
NODE_ENV=production
PORT=${{PORT}}

# Security (Required)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Admin Credentials (Optional - defaults will be used if not set)
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=securepassword123
```

### 3. Set Up Database

1. In Coolify, create a new MySQL database service
2. Note the database credentials and connection URL
3. Update the `DATABASE_URL` environment variable in your application

## Default Credentials

- **Super Admin**:
  - Username: `superadmin`
  - Password: `securepassword123`

## Access Your Application

Once deployed, Coolify will provide a domain for your application. You can access:

- **Main Application**: `https://your-domain.coolify.io`
- **Admin Panel**: `https://your-domain.coolify.io/admin`
- **Analytics Dashboard**: `https://your-domain.coolify.io/admin` (login required)
- **Health Check**: `https://your-domain.coolify.io/health`

## Features Included

- ✅ **Analytics Dashboard**: Real-time visitor tracking, traffic sources, device analytics
- ✅ **Blog Management**: Create, edit, and manage blog posts
- ✅ **Admin Panel**: Comprehensive admin interface with analytics
- ✅ **User Authentication**: Secure login system
- ✅ **File Uploads**: Image and file upload capabilities
- ✅ **SEO Optimization**: Meta tags and SEO fields
- ✅ **Responsive Design**: Mobile-friendly interface

## Environment Variables Reference

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `DATABASE_URL` | MySQL connection string | Yes | - | `mysql://user:pass@host:3306/db?ssl-mode=REQUIRED` |
| `PORT` | Server port | Yes | 3000 | Auto-set by Coolify |
| `NODE_ENV` | Environment mode | Yes | production | `production` |
| `SESSION_SECRET` | Session encryption key | Yes | - | `a24319eb1c35038c48dc9c4cdbc964e56da9d6290e8898fc1ca00309c88d0ecf` |
| `SUPER_ADMIN_USERNAME` | Admin username | No | superadmin | `superadmin` |
| `SUPER_ADMIN_PASSWORD` | Admin password | No | securepassword123 | `securepassword123` |

## Troubleshooting

### Database Connection Issues
- Ensure the DATABASE_URL is correctly formatted
- Verify SSL mode is set to REQUIRED for Coolify databases
- Check that the database service is running

### Build Failures
- Check the build logs in Coolify
- Ensure all dependencies are properly listed in package.json
- Verify the Dockerfile is correct (uses Node.js 20)

### Health Check Failures
- The application uses `/health` endpoint for health checks
- Ensure the PORT environment variable is properly configured
- Check server logs for startup errors

### Analytics Not Working
- Ensure client-side JavaScript is enabled
- Check browser console for errors
- Verify database tables are created (run migrations)

## File Structure

```
/app
├── client/          # React frontend (Vite)
├── server/          # Express backend (TypeScript)
├── shared/          # Shared types/schemas
├── dist/            # Built application (generated)
├── uploads/         # User uploaded files
├── package.json     # Dependencies and scripts
├── Dockerfile       # Container configuration (Node.js 20)
├── coolify.json     # Coolify service config
└── drizzle.config.ts # Database migrations
```

## Post-Deployment Steps

1. **Verify Database Connection**: Check that the database is connected and tables are created
2. **Test Admin Login**: Access `/admin` and login with default credentials
3. **Check Analytics**: Navigate to Analytics tab in admin panel
4. **Test Blog Features**: Create a test blog post
5. **Update DNS**: Point your custom domain to Coolify if needed

## Security Notes

- Change the default admin password in production
- Use a strong SESSION_SECRET (auto-generated in this deployment)
- Ensure DATABASE_URL uses SSL mode for secure connections
- Regularly update dependencies for security patches

## Support

If you encounter issues:
1. Check Coolify application logs
2. Verify environment variables are set correctly
3. Ensure database connectivity and credentials
4. Review the application server logs
5. Check browser developer tools for client-side errors</content>
<parameter name="filePath">/Users/manojkumar/Desktop/Work flow/BlogStreamPro/COOLIFY_DEPLOYMENT.md