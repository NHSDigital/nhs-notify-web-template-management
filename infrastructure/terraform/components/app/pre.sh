#!/usr/bin/env bash

set -euo pipefail # safe scripting

# build backend API lambdas
(
    cd "$( git rev-parse --show-toplevel )/infrastructure/api"
    npm ci
    npm run build
)
