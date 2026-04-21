# Stage 1: Build
FROM node:20 AS builder

# Re-ensure build tools are present for native compilation
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Use the specific pnpm version from project
RUN npm install -g pnpm@10.26.1

# Copy project files
COPY package.json pnpm-lock.yaml ./

# Install dependencies. 
# Because of "onlyBuiltDependencies" in package.json, better-sqlite3 will now build automatically.
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Increase memory limit for build (4GB)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application
RUN pnpm run build

# Stage 2: Production
FROM node:20-slim

WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/.output ./.output

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", ".output/server/index.mjs"]
