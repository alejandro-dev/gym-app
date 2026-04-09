#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
DIST_ENTRY="${APP_DIR}/dist/src/main.js"

APP_PID=""
LAST_FINGERPRINT=""

watch_fingerprint() {
  (
    cd "${ROOT_DIR}"
    find apps/api/src packages/types -type f \( -name '*.ts' -o -name '*.js' -o -name '*.json' \) -print0 \
      | xargs -0 stat -f '%m %N' \
      | sort \
      | shasum -a 1 \
      | awk '{ print $1 }'
  )
}

stop_app() {
  if [[ -n "${APP_PID}" ]] && kill -0 "${APP_PID}" 2>/dev/null; then
    kill "${APP_PID}" 2>/dev/null || true
    wait "${APP_PID}" 2>/dev/null || true
  fi
  APP_PID=""
}

start_app() {
  stop_app
  node "${DIST_ENTRY}" &
  APP_PID=$!
}

cleanup() {
  stop_app
}

trap cleanup EXIT INT TERM

cd "${APP_DIR}"
pnpm exec nest build
LAST_FINGERPRINT="$(watch_fingerprint)"
start_app

echo "API dev watcher activo. Escuchando cambios en apps/api/src y packages/types..."

while true; do
  sleep 1
  CURRENT_FINGERPRINT="$(watch_fingerprint)"

  if [[ "${CURRENT_FINGERPRINT}" != "${LAST_FINGERPRINT}" ]]; then
    echo "Cambio detectado. Recompilando backend..."

    if pnpm exec nest build; then
      LAST_FINGERPRINT="${CURRENT_FINGERPRINT}"
      start_app
      echo "Backend reiniciado."
    else
      echo "La recompilacion fallo. El proceso anterior sigue detenido hasta el siguiente build correcto."
    fi
  fi
done
