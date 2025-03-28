#!/bin/bash

set -euo pipefail

# feature flag
export NEXT_PUBLIC_ENABLE_LETTERS=true

export INCLUDE_AUTH_PAGES=true

npm run accessibility-test-setup -w tests/accessibility

npm run build

npm run app:start --prefix frontend

npm run app:wait --prefix frontend

npm run test:accessibility -w tests/accessibility

npm run accessibility-test-teardown  -w tests/accessibility
