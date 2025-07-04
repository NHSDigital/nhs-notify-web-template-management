#!/bin/bash

set -euo pipefail

# feature flag
export NEXT_PUBLIC_ENABLE_PROOFING=true

export INCLUDE_AUTH_PAGES=true

npm run accessibility-test-setup -w tests/accessibility

npm run build

mkdir -p ./frontend/public/testing

cp ./utils/utils/src/email-templates/template-submitted-email.html ./frontend/public/testing/
cp ./utils/utils/src/email-templates/proof-requested-email.html ./frontend/public/testing/

npm run app:start --prefix frontend

npm run app:wait --prefix frontend

npm run test:accessibility -w tests/accessibility

npm run accessibility-test-teardown  -w tests/accessibility
