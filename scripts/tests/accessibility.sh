#!/bin/bash

set -euo pipefail

npm run copy-files-for-testing

npm run create-test-user

npm run build --prefix frontend

npm run app:start --prefix frontend

npm run app:wait --prefix frontend

npm run test:accessibility

npm run delete-test-user
