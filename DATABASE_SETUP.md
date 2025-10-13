# Database Setup Guide

## MySQL Database Setup for Coolify

### 1. Get Your Database Credentials

In your Coolify dashboard:

1. Go to your project
2. Find your MySQL service
3. Go to the "Environment" or "Configuration" tab
4. Copy the database connection details

### 2. Update Environment Variables

Edit the `.env` file in your project root and replace the `DATABASE_URL` with your actual database credentials:

```env
DATABASE_URL=mysql://username:password@hostname:port/database_name
```

**Example:**
```env
DATABASE_URL=mysql://testcraft_user:mySecurePass123@mysql-abc123.coolify.io:3306/testcraft_world
```

### 3. Create Database Tables

Once you've updated the DATABASE_URL, run the migration:

```bash
npm run db:push
```

This will create all the necessary tables:
- `users` - User accounts and profiles
- `categories` - Article categories
- `articles` - Blog posts and content

### 4. Seed Initial Data

The application will automatically create a super admin user when it first starts. You can configure the credentials in your `.env` file:

```env
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=your_secure_password
```

### 5. Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Troubleshooting

- **Connection Error**: Make sure your DATABASE_URL is correctly formatted
- **Access Denied**: Verify your database credentials are correct
- **Port Issues**: Ensure the MySQL port (usually 3306) is accessible

## Database Schema

The application uses the following tables:

- **users**: User accounts with authentication
- **categories**: Content categories (Business, Technology, etc.)
- **articles**: Blog posts with full content management