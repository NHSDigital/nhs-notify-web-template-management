#!/bin/bash
set -euo pipefail

script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

source "${script_path}/lib/download-consumer-pacts.sh"

contract_tests_root_dir=$(realpath "${script_path}/..")

SUMMARY_FILE="${GITHUB_STEP_SUMMARY:-"$HOME/Desktop/summary.md"}"
# SUMMARY_FILE="${GITHUB_STEP_SUMMARY:-/dev/null}"

provider="templates"

echo "Downloading Pact files for provider: ${provider}"

count=$(download_consumer_pacts $provider)

echo "Downloaded ${count} Pact files for provider: ${provider}"

if [[ "$count" -gt 0 ]]; then
  echo "Pact contracts found — running provider contract tests..."

  echo "### 🟢 Pact contracts found for provider \`$provider\`" >> "$SUMMARY_FILE"

  if npm run test:contracts:provider; then
    echo "### 🟢 Provider contract tests: **PASSED**" >> "$SUMMARY_FILE"
  else
    echo "### 🔴 Provider contract tests: **FAILED**" >> "$SUMMARY_FILE"
    exit 1
  fi
else
  echo "### 🟡 No contracts found for \`$provider\` — skipping provider contract tests" >> "$SUMMARY_FILE"
  echo "### 🟡 Provider contract tests: **SKIPPED**" >> "$SUMMARY_FILE"
fi
