#!/bin/bash

set -euo pipefail

is_local=$( [[ -z ${BASE_URL:-} || ${BASE_URL:-} == *"localhost"* ]] )
if $is_local; then
    npm run app:start

    npm run app:wait
fi

npm run test:accessibility

if $is_local; then
    npm run app:stop
fi