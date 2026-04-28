#!/bin/bash

# ==========================================
# CONFIGURATION
# ==========================================
# Ganti dengan Project Registry Anda
# Contoh: registry.gitlab.com/username/project-name
REGISTRY_URL="registry.gitlab.com/cvudumbarainformatika/nuxt-cms-app"
IMAGE_TAG="latest"
FULL_IMAGE_NAME="$REGISTRY_URL:$IMAGE_TAG"

SERVER_USER="pdpi"
SERVER_IP="103.49.239.185"  # IP Server Anda
APP_DIR="/opt/apps/frontend/gitlab" # Path di server

# ==========================================
# 0. CHECK & LOGIN (Optional Check)
# ==========================================
echo "🔍 Checking Docker Login..."
# Check for registry domain in config (e.g. registry.gitlab.com)
REGISTRY_DOMAIN=$(echo "$REGISTRY_URL" | cut -d/ -f1)

if ! grep -q "$REGISTRY_DOMAIN" ~/.docker/config.json 2>/dev/null; then
    echo "⚠️  You are not logged in to $REGISTRY_DOMAIN locally."
    echo "   Please run: docker login $REGISTRY_DOMAIN"
    exit 1
fi

# ==========================================
# 1. BUILD IMAGE (LOCAL)
# ==========================================
echo "🚀 Building Docker image locally (Forcing Platform: linux/amd64)..."
# Force build for Linux Server Architecture
docker build --no-cache --platform linux/amd64 -t $FULL_IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# ==========================================
# 2. PUSH IMAGE TO REGISTRY
# ==========================================
echo "⬆️  Pushing image to GitLab Registry..."
docker push $FULL_IMAGE_NAME

if [ $? -ne 0 ]; then
    echo "❌ Docker Push failed! Check your internet or login credentials."
    exit 1
fi

# ==========================================
# 3. PREPARE SERVER & TRANSFER CONFIG
# ==========================================
echo "📂 Preparing server configuration..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $APP_DIR/nginx $APP_DIR/ssl"

# Upload Nginx Config
scp -r nginx/nginx.conf $SERVER_USER@$SERVER_IP:$APP_DIR/nginx/

# Upload SSL Certificates
echo "🔒 Uploading SSL certificates..."
scp ssl/cloudflare-origin.pem $SERVER_USER@$SERVER_IP:$APP_DIR/ssl/
scp ssl/cloudflare-origin.key $SERVER_USER@$SERVER_IP:$APP_DIR/ssl/

# Create Production Docker Compose (Uses Registry Image)
cat > docker-compose.gitlab.yml <<EOF
services:
  front-cms:
    image: $FULL_IMAGE_NAME
    container_name: front-cms
    restart: always
    volumes:
      - /opt/apps/frontend/uploads:/app/public/uploads
    environment:
      - NUXT_PUBLIC_API_BASE=/backend
      - NUXT_API_SECRET_TARGET=http://api-go-prod:8080
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - /opt/apps/frontend/uploads:/usr/share/nginx/html/uploads
    depends_on:
      - front-cms
    networks:
      - app-network

networks:
  app-network:
    external: true
    name: gitlab_app-network
EOF

scp docker-compose.gitlab.yml $SERVER_USER@$SERVER_IP:$APP_DIR/docker-compose.yml
rm docker-compose.gitlab.yml

# ==========================================
# 4. DEPLOY ON SERVER
# ==========================================
echo "🚀 Deploying on server..."

# Command to run on server:
# 1. Login (Optional - assumes you might need to login once manually or pass credentials)
#    NOTE: Best practice is to login once manually on the server: `docker login registry.gitlab.com`
# 2. Pull latest image
# 3. Restart services

ssh $SERVER_USER@$SERVER_IP "cd $APP_DIR && \
    echo '⬇️  Pulling latest image...' && \
    docker compose pull front-cms && \
    echo '🔄 Restarting front-cms container...' && \
    docker compose up -d"

echo "✅ Deployment with GitLab Registry Success!"
