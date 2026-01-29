#!/bin/bash

set -euo pipefail

# feature flag
export INCLUDE_AUTH_PAGES=true

npm run accessibility-test-setup -w tests/accessibility
npm run build
mkdir -p ./frontend/public/testing
cp ./utils/utils/src/email-templates/* ./frontend/public/testing/

npm run start --prefix frontend &
APP_PID=$!

npm run app:wait --prefix frontend

TEST_EXIT_CODE=0
npm run test:accessibility -w tests/accessibility || TEST_EXIT_CODE=$?
echo "TEST_EXIT_CODE=$TEST_EXIT_CODE"

kill $APP_PID 2>/dev/null || true
wait $APP_PID 2>/dev/null || true

mkdir -p ./tests/acceptance-test-report
cp -r ./tests/accessibility/.reports/accessibility ./tests/acceptance-test-report
npm run accessibility-test-teardown  -w tests/accessibility

exit $TEST_EXIT_CODE
