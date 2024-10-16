#!/bin/bash

set -euo pipefail

npm run create-test-user

npm run build

npm run app:start

npm run app:wait

npm run test:accessibility

npm run delete-test-user
