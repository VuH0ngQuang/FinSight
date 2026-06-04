#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
ENV_FILE="${ENV_FILE:-.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Create it first:"
  echo "  cp .env.example .env"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker command not found"
  exit 1
fi

echo "Validating Docker Compose config..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config --quiet

echo "Stopping old containers..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down

echo "Building images..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build --pull "$@"

echo "Starting containers..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --force-recreate

echo "Running containers:"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
