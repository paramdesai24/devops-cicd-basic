# Use lightweight Node 22 Alpine base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy package dependency manifests
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy application source and static assets
COPY src/ ./src/
COPY public/ ./public/

# Expose default application port
EXPOSE 3000

# Container liveness health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the cloud-native application
CMD ["npm", "start"]
