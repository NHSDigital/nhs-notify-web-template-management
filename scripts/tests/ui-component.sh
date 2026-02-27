#!/bin/bash

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
npx playwright install --with-deps > /dev/null
cd tests/test-team
TEST_EXIT_CODE=0
npm run test:component || TEST_EXIT_CODE=$?
echo "TEST_EXIT_CODE=$TEST_EXIT_CODE"

mkdir -p ../acceptance-test-report
cp -r ./playwright-report ../acceptance-test-report
[[ -e test-results ]] && cp -r ./test-results ../acceptance-test-report

exit $TEST_EXIT_CODE
