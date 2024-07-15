#!/bin/bash

set -euo pipefail

BASE_URL=${BASE_URL:-}

is_local=false

if [[ -z "$BASE_URL" || $BASE_URL == *"localhost"* ]]; then
    is_local=true
fi

if $is_local; then
    npm run build

    npm run app:start

    npm run app:wait
fi

npm run test:accessibility

if $is_local; then
    npm run app:stop
fi
