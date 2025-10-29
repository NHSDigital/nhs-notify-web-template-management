#!/bin/bash

set -euo pipefail

# feature flag
export INCLUDE_AUTH_PAGES=true

npm run accessibility-test-setup -w tests/accessibility
npm run build
mkdir -p ./frontend/public/testing
cp ./utils/utils/src/email-templates/* ./frontend/public/testing/

npm run app:start --prefix frontend
npm run app:wait --prefix frontend

journeys=(
  landingPageTests
  allTemplatesTests
  chooseTemplateTests
  nhsAppTests
  smsTests
  emailTests
  lettersTests
  userEmailsTests
  errorsTests
  routingTests
  templatesPagesWithRoutingContentEnabledTests
)

TEST_EXIT_CODE=0

for journey in "${journeys[@]}"; do
  echo "==== ▶️  Running Pa11y journey: $journey ====="

  report_dir="./.reports/accessibility/$journey"
  mkdir -p "$report_dir"

  JOURNEY="$journey" REPORT_DEST="$report_dir" \
    npm run test:accessibility -w tests/accessibility

  exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    TEST_EXIT_CODE=$exit_code
  fi
  echo;
done

mkdir -p ./tests/acceptance-test-report
cp -r ./tests/accessibility/.reports/accessibility ./tests/acceptance-test-report
npm run accessibility-test-teardown  -w tests/accessibility

exit $TEST_EXIT_CODE
