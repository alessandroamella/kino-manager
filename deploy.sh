#!/bin/bash
# Usage: ./deploy.sh [backend|web|all]   (default: all)
set -euo pipefail

TARGET="${1:-all}"
BRANCH="master"
cd "$(dirname "$0")"

# Build and run on Node 24 even when the nvm default is older
if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  set +u # nvm.sh reads unset variables
  source "$HOME/.nvm/nvm.sh"
  nvm use 24 >/dev/null
  set -u
fi
# pm2 may be installed under a different Node version: borrow it from there
if ! command -v pm2 >/dev/null; then
  PM2_BIN="$(ls -d "$HOME"/.nvm/versions/node/*/bin/pm2 2>/dev/null | tail -1)"
  [[ -n "$PM2_BIN" ]] && export PATH="$PATH:$(dirname "$PM2_BIN")"
fi
command -v pm2 >/dev/null || { echo "pm2 not found" >&2; exit 1; }
echo "Using Node $(node -v)"

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
