#!/bin/bash

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
npx playwright install --with-deps > /dev/null
cd tests/test-team
npm run test:api
TEST_EXIT_CODE=$?
echo "TEST_EXIT_CODE=$TEST_EXIT_CODE"

pwd
ls
ls tests
ls tests/test-team
ls tests/test-team/playwright-report

cp tests/test-team/playwright-report ./tests/acceptance-test-report

exit $TEST_EXIT_CODE
