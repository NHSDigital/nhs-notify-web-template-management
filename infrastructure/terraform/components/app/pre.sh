#!/usr/bin/env bash

set -euo pipefail # safe scripting

set -x

# build backend API lambdas

original_dir=$( pwd )

cd "$( git rev-parse --show-toplevel )/infrastructure/api"

npm ci
npm run build
echo "build succeeded"

echo -e "All pre actions complete!\n"
