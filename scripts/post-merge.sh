#!/bin/bash
set -e
pnpm install --frozen-lockfile
# Database changes require explicit approval; setup must not run migrations.
