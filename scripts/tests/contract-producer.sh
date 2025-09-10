#!/bin/bash

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

./scripts/set_github_token.sh

npm --workspace tests/contracts/producer install @nhsdigital/notify-core-consumer-contracts@latest --no-save --no-package-lock

npm --workspace tests/contracts/producer run test
