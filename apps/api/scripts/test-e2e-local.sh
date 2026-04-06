#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/gym_app_test?schema=public}"
export JWT_ACCESS_SECRET="${JWT_ACCESS_SECRET:-superaccesssecret}"
export JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-superrefreshsecret}"
export JWT_ACCESS_TTL_SECONDS="${JWT_ACCESS_TTL_SECONDS:-900}"
export JWT_REFRESH_TTL_SECONDS="${JWT_REFRESH_TTL_SECONDS:-604800}"
export NODE_ENV="${NODE_ENV:-test}"

bash "${SCRIPT_DIR}/test-db-up.sh"

cd "${ROOT_DIR}/apps/api"

pnpm exec prisma generate --schema prisma/schema.prisma
pnpm exec prisma migrate deploy --schema prisma/schema.prisma
pnpm exec jest --config ./test/jest-e2e.json --runInBand
