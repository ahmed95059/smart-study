# Server Dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

# Copy source
COPY src ./src

# Expose port and run
ENV PORT=5000
EXPOSE 5000
CMD ["npm", "run", "dev"]
