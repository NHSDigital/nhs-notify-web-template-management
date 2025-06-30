#!/bin/bash
set -euo pipefail

script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

source "${script_path}/lib/download-consumer-pacts.sh"

contract_tests_root_dir=$(realpath "${script_path}/..")

SUMMARY_FILE="${GITHUB_STEP_SUMMARY:-/dev/null}"

echo "### Pact Provider Contract Test Results" >> "$SUMMARY_FILE"
echo "| Provider | Consumer Pacts found? | Result |" >> "$SUMMARY_FILE"
echo "|----------|-----------------------|--------|" >> "$SUMMARY_FILE"

provider="templates"

echo "Downloading Pact files for provider: ${provider}"

count=$(download_consumer_pacts $provider)

echo "Downloaded ${count} Pact files for provider: ${provider}"

if [[ "$count" -gt 0 ]]; then
  echo "Pact contracts found — running provider contract tests..."

  if npm --workspace tests/contracts run test:provider; then
    echo "| ${provider} | 🟢 ${count} contracts found | 🟢 Passed |" >> "$SUMMARY_FILE"
  else
    echo "| ${provider} | 🟢 ${count} contracts found | 🔴 Failed |" >> "$SUMMARY_FILE"
    exit 1
  fi
else
  echo "| ${provider} | 🟡 0 contracts found | 🟡 Skipped |" >> "$SUMMARY_FILE"
fi
