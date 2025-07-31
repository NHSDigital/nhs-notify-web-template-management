#!/bin/bash

set -euo pipefail

# feature flag
export NEXT_PUBLIC_ENABLE_PROOFING=true
export INCLUDE_AUTH_PAGES=true

npm run accessibility-test-setup -w tests/accessibility
npm run build
mkdir -p ./frontend/public/testing
cp ./utils/utils/src/email-templates/* ./frontend/public/testing/

npm run app:start --prefix frontend
npm run app:wait --prefix frontend

TEST_EXIT_CODE=0
npm run test:accessibility -w tests/accessibility || TEST_EXIT_CODE=$?
echo "TEST_EXIT_CODE=$TEST_EXIT_CODE"

mkdir -p ./tests/acceptance-test-report
cp -r ./tests/accessibility/.reports/accessibility ./tests/acceptance-test-report
npm run accessibility-test-teardown  -w tests/accessibility

exit $TEST_EXIT_CODE
