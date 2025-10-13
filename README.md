# Testcraft - Testcraft World

A modern, full-featured blogging platform built with React, TypeScript, Express.js, and MySQL. Features user authentication, article management, rich text editing, and responsive design.

## 🚀 Features

- **User Authentication**: Secure login/registration with Passport.js
- **Article Management**: Create, edit, and publish articles with rich text editor
- **User Dashboard**: Personal dashboard for managing articles and profile
- **Responsive Design**: Mobile-first design with Tailwind CSS and Shadcn UI
- **Database Integration**: MySQL with Drizzle ORM
- **Session Management**: Secure session handling
- **SEO Friendly**: Meta tags and structured content
- **Dark/Light Mode**: Theme switching support

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js, Passport.js
- **Database**: MySQL with Drizzle ORM
- **Authentication**: Passport Local Strategy
- **Deployment**: Docker, Docker Compose

## 📋 Prerequisites

- Node.js 18+
- MySQL 8.0+
- Docker & Docker Compose (for containerized deployment)

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/manojkumarlabhala/Testcraft.world.git
   cd Testcraft
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Database Setup**
   ```bash
   # Update DATABASE_URL in .env with your MySQL connection string
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

### Coolify Deployment (Recommended)

1. **Connect your GitHub repository**
   - In Coolify dashboard, connect your GitHub account
   - Select the `Testcraft` repository

2. **Create a new service**
   - Choose "Application" as service type
   - Select the repository and main branch
   - Coolify will automatically detect the `coolify.json` configuration

3. **Configure Database**
   - Create a MySQL database service in Coolify
   - Link it to your application
   - Coolify will automatically set the `DATABASE_URL` environment variable

4. **Environment Variables**
   ```env
   SESSION_SECRET=your-super-secret-session-key-change-this-in-production
   SUPER_ADMIN_USERNAME=superadmin
   SUPER_ADMIN_PASSWORD=securepassword123
   ```

5. **Deploy**
   - Coolify will automatically build and deploy your application
   - Access your app at the generated domain

### Production Docker Deployment

For production deployment with Docker Compose:

```bash
# Use the production compose file
docker-compose -f docker-compose.prod.yml up -d

# Or build and run manually
docker build -t testcraft .
docker run -p 3000:3000 --env-file .env testcraft
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example` or `.env.coolify.example`:

```env
PORT=3000
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
DATABASE_URL=mysql://username:password@host:port/database?ssl-mode=REQUIRED
NODE_ENV=production
```

### Coolify Environment Variables

When deploying to Coolify, these variables will be automatically set:

- `DATABASE_URL`: Automatically provided when you link a MySQL database
- `PORT`: Set to 3000 in coolify.json
- `NODE_ENV`: Set to production

You only need to manually set:
- `SESSION_SECRET`: Generate a strong random string
- Optional admin credentials

### Database Setup

1. Create a MySQL database in Coolify
2. Link it to your application
3. The `DATABASE_URL` will be automatically configured
4. Run database migrations: `npm run db:push`

## 🏗️ Project Structure

```
Testcraft/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── vite.ts            # Vite development setup
├── shared/                 # Shared types and schemas
├── dist/                  # Build output
└── public/                # Static assets
```

## 🔐 Authentication

### Default Credentials

- **Super Admin**: `superadmin` / `securepassword123`
- **Test User**: `testuser` / `testpass123`

### User Roles

- **Admin**: Full access to all features
- **User**: Standard user with article creation capabilities

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
# Using Docker Compose
docker-compose up -d

# Or using Docker directly
docker build -t testcraft .
docker run -p 3000:3000 --env-file .env testcraft
```

### Environment Setup for Production

1. Set `NODE_ENV=production`
2. Use a production-grade database (AWS RDS, PlanetScale, etc.)
3. Set a strong `SESSION_SECRET`
4. Configure proper SSL/TLS
5. Set up reverse proxy (nginx, Caddy, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For support, please open an issue on GitHub or contact the maintainers.

---

Built with ❤️ by [Manoj Kumar Labhala](https://github.com/manojkumarlabhala)