#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
TEST_DB_NAME="${TEST_DB_NAME:-gym_app_test}"

cd "${ROOT_DIR}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required to run API e2e tests locally." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running. Start Docker and try again." >&2
  exit 1
fi

docker compose up -d postgres

until docker exec gym-postgres pg_isready -U postgres >/dev/null 2>&1; do
  sleep 1
done

if ! docker exec gym-postgres psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${TEST_DB_NAME}'" | grep -q 1; then
  docker exec gym-postgres createdb -U postgres "${TEST_DB_NAME}"
fi

echo "Test database ready: ${TEST_DB_NAME}"
