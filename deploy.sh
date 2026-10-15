#!/bin/bash
# Usage: ./deploy.sh [backend|web|all]   (default: all)
set -euo pipefail

TARGET="${1:-all}"
BRANCH="master"
cd "$(dirname "$0")"

echo "Pulling latest changes from $BRANCH branch..."
git pull origin "$BRANCH"

echo "Installing dependencies..."
pnpm install --frozen-lockfile

if [[ "$TARGET" == "backend" || "$TARGET" == "all" ]]; then
  echo "Applying Prisma migrations..."
  pnpm --filter backend exec prisma migrate deploy

  echo "Building backend..."
  pnpm turbo run build --filter backend

  echo "Restarting PM2 process: Kino Manager BE..."
  pm2 restart "Kino Manager BE"
fi

if [[ "$TARGET" == "web" || "$TARGET" == "all" ]]; then
  echo "Building web..."
  pnpm turbo run build --filter web

  echo "Restarting PM2 process: Kino Manager FE..."
  pm2 restart "Kino Manager FE"
fi

echo "Deployment completed successfully!"
