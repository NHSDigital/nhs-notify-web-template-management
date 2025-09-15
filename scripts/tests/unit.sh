#!/bin/bash

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

# read optional first arg; empty means "run all workspaces"
WORKSPACE="${WORKSPACE:-}"

# This file is for you! Edit it to call your unit test suite. Note that the same
# file will be called if you run it locally as if you run it on CI.

# Replace the following line with something like:
#
#   rails test:unit
#   python manage.py test
#   npm run test
#
# or whatever is appropriate to your project. You should *only* run your fast
# tests from here. If you want to run other test suites, see the predefined
# tasks in scripts/test.mk.

# run tests
if [[ -n "$WORKSPACE" ]]; then
  npm run test:unit --workspace="$WORKSPACE"
else
  npm run test:unit --workspaces

  # merge coverage reports
  mkdir -p .reports
  TMPDIR="./.reports" ./node_modules/.bin/lcov-result-merger \
  "**/.reports/unit/coverage/lcov.info" \
    ".reports/lcov.info" \
    --ignore "node_modules" \
    --prepend-source-files \
    --prepend-path-fix "../../.."
fi
