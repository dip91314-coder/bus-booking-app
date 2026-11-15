# --- Node.js Backend Dockerfile ---
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies needed for native modules (if any)
RUN apk add --no-cache python3 make g++

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Ensure non-root node user
USER node

# Expose backend API port
EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]
