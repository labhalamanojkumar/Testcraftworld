# BlogStreamPro

A modern blog platform built with React, TypeScript, Express, and MySQL.

## Database Connection Issues & Solutions

### Common Error: "Connections using insecure transport are prohibited while --require_secure_transport=ON"

This error occurs when your MySQL server requires SSL connections but your application is trying to connect without SSL.

#### Root Causes:
1. **Coolify/Remote MySQL databases** often require SSL by default
2. **express-mysql-session** package uses its own MySQL connection that may not inherit SSL settings
3. **Session store configuration** issues with SSL

#### Solutions:

##### 1. Environment Configuration
Ensure your `.env` file has the correct DATABASE_URL format:
```env
DATABASE_URL=mysql://user:password@host:port/database?ssl-mode=REQUIRED
```

##### 2. SSL Configuration
For remote databases (Coolify, AWS RDS, etc.), always use:
- `ssl-mode=REQUIRED` for mandatory SSL
- `ssl-mode=VERIFY_CA` for certificate verification
- `ssl-mode=VERIFY_IDENTITY` for full verification

##### 3. Session Store Issues
The application currently uses MemoryStore for sessions to avoid SSL issues with express-mysql-session. For production, consider:
- Using a custom MySQL session store that shares the main database pool
- Using Redis for session storage
- Implementing proper SSL configuration for express-mysql-session

##### 4. Testing Database Connection
Use the built-in database test script:
```bash
npm run db:test
# or
node -r dotenv/config scripts/db-test.js
```

##### 5. Troubleshooting Steps
1. **Check DATABASE_URL format**: Ensure it includes proper SSL parameters
2. **Test network connectivity**: Verify you can reach the database host
3. **Validate SSL requirements**: Some providers require SSL, others don't
4. **Check credentials**: Ensure username/password are correct
5. **Verify database exists**: Make sure the database name is correct

### Preventing Future Issues

1. **Use connection validation**: The app now validates database connections on startup
2. **Monitor connection health**: Regular health checks prevent silent failures
3. **Proper error handling**: Detailed error messages help diagnose issues quickly
4. **Environment-specific configs**: Different settings for development vs production

### Development vs Production

- **Development**: Can use local MySQL without SSL
- **Production**: Always use SSL for remote databases
- **Coolify**: Requires SSL with `ssl-mode=REQUIRED`

## Features

- Rich text editor with WordPress-like functionality
- User authentication and session management
- Article publishing and management
- Category organization
- Image upload support
- SEO optimization fields
- Responsive design

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, React Quill
- **Backend**: Express.js, Node.js
- **Database**: MySQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **Deployment**: Coolify ready

## Deployment

### Coolify VPS Deployment

BlogStreamPro is ready for deployment on Coolify VPS. See [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md) for detailed deployment instructions.

#### Quick Deploy:
1. Connect your GitHub repository to Coolify
2. Set up a MySQL database in Coolify
3. Configure environment variables
4. Deploy automatically

#### Local Docker Testing:
```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up --build
```

### Environment Variables

Required for production:
- `DATABASE_URL` - MySQL connection string with SSL
- `SESSION_SECRET` - Random secret key for sessions
- `PORT` - Port for the application (set by Coolify)

See `.env.example` for all available options.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your `.env` file with database configuration
4. Run database migrations: `npm run db:push`
5. Start development server: `npm run dev`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema
- `npm run db:test` - Test database connection