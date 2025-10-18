#!/usr/bin/env bash

set -e

################################
# CONFIGURATION
# Change these values as needed
DOMAIN="sporty.tihlde.org"
PORT=6969
ENV_FILE_PATH=".env"
################################

COMMIT_HASH=$(git rev-parse --short HEAD)
IMAGE_NAME="$DOMAIN:$COMMIT_HASH"

echo "-> Building new Docker image"
docker build --no-cache -t $IMAGE_NAME .

# REMOVE IF PROJECT DOES NOT USE PRISMA
echo "-> Migrating database"
prisma migrate deploy

echo "-> Stopping and removing old container"
docker rm -f $DOMAIN || true

echo "-> Starting new container"
docker run --env-file $ENV_FILE_PATH -p $PORT:3000 --name $DOMAIN --restart unless-stopped -d $IMAGE_NAME
