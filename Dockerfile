# Production Multi-Stage Node.js Container for Aventus Empire Bot
FROM node:24-bookworm-slim AS base

# Install system dependencies for native builds and image tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency definitions
COPY package.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy source code and assets
COPY src/ ./src/
COPY .env.example ./

# Create data and temp directories
RUN mkdir -p data temp

# Non-root user for security
USER node

# Start the bot
CMD ["node", "src/index.js"]
