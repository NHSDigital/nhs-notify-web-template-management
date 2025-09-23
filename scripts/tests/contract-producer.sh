#!/usr/bin/env bash
set -euo pipefail

# Want to install the latest version of the consumer contracts
# Everything existing in workspaces makes this tricky
# 1. make a backup of the original package.json
# 2. patch package.json so references to local packages use "file:" syntax
# 3. install latest versions of consumer contracts into tests directory
# 4. run tests
# 5. clean up local node_modules and backup of package.json

# Go to repo root -> producer package
ROOT_DIR="$(git rev-parse --show-toplevel)"
PKG_DIR="$ROOT_DIR/tests/contracts/producer"
cd "$PKG_DIR"

# Backup package.json
cp package.json package.json.bak

# Setup restore on exit
cleanup() {
  if [[ -f "package.json.bak" ]]; then
    mv package.json.bak package.json
  fi

  rm -rf node_modules
}
trap cleanup EXIT

# Patch the local package references in package.json
jq '
  .dependencies["nhs-notify-web-template-management-utils"] = "file:../../../utils/utils" |
  .dependencies["@nhsdigital/nhs-notify-event-schemas-template-management"] = "file:../../../packages/event-schemas"
' package.json > package.json.tmp && mv package.json.tmp package.json

$ROOT_DIR/scripts/set_github_packages_token.sh

# Install isolated from workspace graph
npm install \
  @nhsdigital/notify-core-consumer-contracts@latest \
  --no-save --no-package-lock \
  --workspaces=false

# Run tests
npm run test
