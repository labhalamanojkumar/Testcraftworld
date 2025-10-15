# Use Node.js 20 Alpine for smaller image size and better performance
FROM node:20-alpine AS base

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package manifests first for better layer caching
COPY package*.json ./

# Install dependencies (prod & dev) for build
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create a slimmer runtime image
FROM node:20-alpine AS runtime
RUN apk add --no-cache curl
WORKDIR /app

# Copy only necessary files from build stage
COPY --from=base /app/dist ./dist
COPY --from=base /app/package*.json ./
COPY --from=base /app/uploads ./uploads

# Install only production dependencies
RUN npm ci --omit=dev

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Ensure uploads dir exists and set permissions
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads
RUN chown -R nextjs:nodejs /app

ENV PORT=3000
USER nextjs

# Expose the port (Coolify may map it differently)
EXPOSE 3000

# Health check using the /health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Start the application (production entrypoint). If migrations are required, use start:migrate
CMD ["npm", "start"]