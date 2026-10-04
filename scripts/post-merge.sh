#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -f pnpm-lock.yaml ]]; then
  CI=true pnpm install --prod=false --frozen-lockfile
else
  CI=true pnpm install --prod=false --no-frozen-lockfile
fi
# Database changes require explicit approval; setup must not run migrations.
