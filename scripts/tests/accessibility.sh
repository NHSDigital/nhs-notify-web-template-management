#!/bin/bash

set -euo pipefail

# feature flag
export NEXT_PUBLIC_ENABLE_LETTERS=true

npm run create-test-user

npm run build

npm run app:start --prefix frontend

npm run app:wait --prefix frontend

npm run test:accessibility

npm run delete-test-user
