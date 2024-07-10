#!/bin/bash

set -euo pipefail

is_local=$( [[ -z ${BASE_URL:-} || ${BASE_URL:-} == *"localhost"* ]] )
if $is_local; then

    # Build NextJS app
    npm run build

    # Run NextJS app in PM2 container
    npm run app:start

    # Wait for the app to start
    npm run app:wait
fi

echo $BASE_URL

npm run test:accessibility

if $is_local; then
    # Stop PM2 container
    npm run app:stop
fi
