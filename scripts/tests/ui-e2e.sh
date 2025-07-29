#!/bin/bash

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
npx playwright install --with-deps > /dev/null
cd tests/test-team

set +e
npm run test:e2e
TEST_EXIT_CODE=$?
set -e

echo "TEST_EXIT_CODE=$TEST_EXIT_CODE"

cp -r ./playwright-report ../acceptance-test-report

exit $TEST_EXIT_CODE
