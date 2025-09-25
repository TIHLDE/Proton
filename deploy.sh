#!/usr/bin/env bash

set -e

COMMIT_HASH=$(git rev-parse --short HEAD)

echo "-> Building new Docker image"
docker build --no-cache -t sporty.tihlde.org:$COMMIT_HASH .

echo "-> Migrating database"
prisma migrate deploy

echo "-> Stopping and removing old container"
docker rm -f sporty.tihlde.org || true

echo "-> Starting new container"
docker run --env-file .env -p 6969:3000 --name sporty.tihlde.org --restart unless-stopped -d sporty.tihlde.org:$COMMIT_HASH
