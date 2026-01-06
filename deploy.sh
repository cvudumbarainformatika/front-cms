#!/bin/bash

# ==========================================
# CONFIGURATION
# ==========================================
SERVER_USER="sasa"
SERVER_IP="192.168.33.2"     # Ganti dengan IP Server Anda
APP_DIR="/opt/apps/frontend/source" # Ganti dengan path di server
IMAGE_NAME="front-cms-prod"
CONTAINER_NAME="front-cms"

# ==========================================
# 1. BUILD IMAGE (LOCAL)
# ==========================================
echo "🚀 Building Docker image locally..."
# Build image dengan tag spesifik
docker build -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# ==========================================
# 2. PREPARE SERVER DIRECTORY
# ==========================================
echo "📂 Preparing server directory..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $APP_DIR/nginx"

# ==========================================
# 3. UPLOAD FILES
# ==========================================
echo "uploading configuration files..."
scp -r nginx/nginx.conf $SERVER_USER@$SERVER_IP:$APP_DIR/nginx/

# Kita buat docker-compose khusus production di server (on-the-fly)
# Mengganti 'build: ...' dengan 'image: ...'
cat > docker-compose.prod.yml <<EOF
services:
  front-cms:
    image: $IMAGE_NAME
    container_name: $CONTAINER_NAME
    restart: always
    environment:
      - NUXT_PUBLIC_API_BASE=/backend
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - front-cms
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
EOF

scp docker-compose.prod.yml $SERVER_USER@$SERVER_IP:$APP_DIR/docker-compose.yml
rm docker-compose.prod.yml # Hapus file temp lokal

# ==========================================
# 4. TRANSFER IMAGE (Docker Save -> SSH -> Docker Load)
# ==========================================
echo "📦 Transferring and loading Docker image to server (this may take a while)..."
# Menggunakan gzip untuk mempercepat transfer
docker save $IMAGE_NAME | gzip | ssh $SERVER_USER@$SERVER_IP "gunzip | docker load"

if [ $? -ne 0 ]; then
    echo "❌ Image transfer failed!"
    exit 1
fi

# ==========================================
# 5. RESTART SERVICES
# ==========================================
echo "🔄 Restarting services on server..."
ssh $SERVER_USER@$SERVER_IP "cd $APP_DIR && docker compose down && docker compose up -d"

echo "✅ Deployment Success!"
