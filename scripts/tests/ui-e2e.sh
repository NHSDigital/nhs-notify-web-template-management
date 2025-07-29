#!/bin/bash

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
npx playwright install --with-deps > /dev/null
cd tests/test-team
TEST_EXIT_CODE=0
npm run test:e2e || TEST_EXIT_CODE=$?
echo "TEST_EXIT_CODE=$TEST_EXIT_CODE"

cp -r ./playwright-report ../acceptance-test-report/playwright-report
[[ -e test-results ]] && cp -r ./test-results ../acceptance-test-report/test-results

exit $TEST_EXIT_CODE
