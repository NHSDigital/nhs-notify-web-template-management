#!/bin/bash

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
npx playwright install --with-deps > /dev/null
cd tests/test-team
npm run test:api
TEST_EXIT_CODE=$?
echo "TEST_EXIT_CODE=$TEST_EXIT_CODE"

cp -r ./playwright-report ../acceptance-test-report

exit $TEST_EXIT_CODE
