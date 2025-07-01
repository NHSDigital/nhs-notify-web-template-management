#!/bin/bash
set -euo pipefail

script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

source "${script_path}/lib/consumer-pacts.sh"

contract_tests_root_dir=$(realpath "${script_path}/..")

SUMMARY_FILE="${GITHUB_STEP_SUMMARY:-/dev/null}"

echo "### Pact Provider Contract Test Results" > "$SUMMARY_FILE"
echo "" > "$SUMMARY_FILE"
echo "| Provider | Consumer Pacts found? | Result |" >> "$SUMMARY_FILE"
echo "|----------|-----------------------|--------|" >> "$SUMMARY_FILE"

providers=("auth" "templates")

for provider in "${providers[@]}"; do
  echo "Downloading Pact files for provider: ${provider}"

  count=$(download_consumer_pacts $provider)

  echo "Downloaded ${count} Pact files for provider: ${provider}"

  if [[ "$count" -gt 0 ]]; then
    echo "Pact contracts found — running $provider provider contract tests..."

    if npx jest tests/$provider/provider; then
      echo "| ${provider} | 🟢 ${count} contracts found | 🟢 Passed |" >> "$SUMMARY_FILE"
    else
      echo "| ${provider} | 🟢 ${count} contracts found | 🔴 Failed |" >> "$SUMMARY_FILE"
      exit 1
    fi
  else
    echo "No Pact contracts found from consumers — skipping $provider provider contract tests..."
    echo "| ${provider} | 🟡 0 contracts found | 🟡 Skipped |" >> "$SUMMARY_FILE"
  fi
done

echo "All provider contract tests passed"
echo "Generating golden contracts"

echo "" > "$SUMMARY_FILE"
echo "" > "$SUMMARY_FILE"
echo "### Golden Contracts" >> "$SUMMARY_FILE"

if npm run pact:generate:provider; then
  echo "Generated golden contracts"
  echo "🟢 Generated golden contracts" >> "$SUMMARY_FILE"
else
  echo "Failed to generate golden contracts"
  echo "🔴 Failed to generate golden contracts" >> "$SUMMARY_FILE"
fi

if npm run pact:upload:provider; then
  echo "Uploaded golden contracts"
  echo "🟢 Uploaded golden contracts" >> "$SUMMARY_FILE"
else
  echo "Failed to upload golden contracts"
  echo "🔴 Failed to upload golden contracts" >> "$SUMMARY_FILE"
fi
