# Stage 1: Build
FROM node:20 AS builder

WORKDIR /app

# Copy package files (use package-lock.json for npm)
COPY package.json package-lock.json ./

# Install dependencies using npm (more forgiving of lockfile mismatch)
RUN npm install

# Copy the rest of the application
COPY . .

# Increase memory limit for build (4GB) - Note: Production server requires Swap if RAM < 4GB
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application
RUN npm run build

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

