#!/bin/bash

set -euo pipefail

# Set BASE_URL to the value of BASE_URL environment variable if it exists, otherwise set it to an empty string
BASE_URL=${BASE_URL:-}

is_local=false

# Check if BASE_URL is empty or contains "localhost", and set is_local to true if the condition is met
if [[ -z "$BASE_URL" || $BASE_URL == *"localhost"* ]]; then
    is_local=true
fi

# If the script is running on a local environment, build the NextJS app
# and run it in a PM2 container. Then wait for the app to start.
if $is_local; then
    # Build NextJS app
    npm run build

    # Run NextJS app in PM2 container
    npm run app:start

    # Wait for the app to start
    npm run app:wait
fi

# Run accessibility tests
npm run test:accessibility

# If the script is running on a local environment, stop the PM2 container
if $is_local; then
    # Stop PM2 container
    npm run app:stop
fi
