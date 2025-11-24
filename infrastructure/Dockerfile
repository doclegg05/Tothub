# Multi-stage production build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init curl && \
    rm -rf /var/cache/apk/*

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S tothub -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=tothub:nodejs /app/dist ./dist
COPY --from=builder --chown=tothub:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=tothub:nodejs /app/package*.json ./

# Create logs and backup directories
RUN mkdir -p /app/logs /app/backups && \
    chown -R tothub:nodejs /app/logs /app/backups

# Switch to non-root user
USER tothub

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]