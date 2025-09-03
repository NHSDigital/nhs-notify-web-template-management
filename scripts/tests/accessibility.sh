#!/bin/bash

set -euo pipefail

# feature flag
export INCLUDE_AUTH_PAGES=true

pnpm run accessibility-test-setup -w tests/accessibility
pnpm run build
mkdir -p ./frontend/public/testing
cp ./utils/utils/src/email-templates/* ./frontend/public/testing/

pnpm run app:start --filter ./frontend
pnpm run app:wait --filter ./frontend

TEST_EXIT_CODE=0
pnpm run test:accessibility -w tests/accessibility || TEST_EXIT_CODE=$?
echo "TEST_EXIT_CODE=$TEST_EXIT_CODE"

mkdir -p ./tests/acceptance-test-report
cp -r ./tests/accessibility/.reports/accessibility ./tests/acceptance-test-report
pnpm run accessibility-test-teardown  -w tests/accessibility

exit $TEST_EXIT_CODE
