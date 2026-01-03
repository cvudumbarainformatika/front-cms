# Stage 1: Build
FROM node:22-slim AS builder

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Install build dependencies for native modules (Debian-based)
RUN apt-get update && apt-get install -y python3 make g++ build-essential

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm run build

# Stage 2: Production
FROM node:22-slim

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

