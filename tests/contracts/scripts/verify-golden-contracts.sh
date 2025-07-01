#!/bin/bash
set -euo pipefail

script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
test_root="$(realpath "$script_path/../tests")"

summary_file="${GITHUB_STEP_SUMMARY:-/dev/null}"

total_failures=0
total_skipped=0
total_passed=0

echo "### Per-Event Results" >> "$summary_file"
echo "| Consumer | Provider | Event | Result |" >> "$summary_file"
echo "|----------|----------|--------|--------|" >> "$summary_file"


for consumer_dir in "$test_root"/*/consumer; do
  consumer_name=$(basename "$(dirname "$consumer_dir")")
  schemas_dir="$consumer_dir/.schemas"
  examples_dir="$consumer_dir/examples"

  if [[ ! -d "$schemas_dir" ]]; then
    echo "No golden schemas downloaded for $consumer_name — skipping"
    total_skipped=$((total_skipped + 1))
    echo "| $consumer_name | $provider | $event | ⚠️ Skipped |" >> "$summary_file"
    continue
  fi

  echo "Validating consumer: $consumer_name"

  while IFS= read -r -d '' schema_path; do
    provider=$(basename "$(dirname "$schema_path")")
    schema_file=$(basename "$schema_path")
    event="${schema_file%.schema.json}"

    example_dir="$examples_dir/$provider/$event"

    echo $example_dir

    if [[ ! -d "$example_dir" ]]; then
      echo "No examples exist for $event from $provider — skipping"
      echo "| $consumer_name | $provider | $event | ⚠️ Skipped |" >> "$summary_file"

      total_skipped=$((total_skipped + 1))
      continue
    fi

    for example in "$example_dir"/*.json; do
      echo "  Validating $example against $schema_path"
      cd $( dirname $schema_path )
      if npx jsonschema validate "$schema_path" "$example"; then
        echo "✅ Valid"
        echo "| $consumer_name | $provider | $event | ✅ Pass |" >> "$summary_file"
        total_passed=$((total_passed + 1))
      else
        echo "❌ Invalid"
        echo "| $consumer_name | $provider | $event | ❌ Failed |" >> "$summary_file"
        total_failures=$((total_failures + 1))
      fi
    done
  done < <(find "$schemas_dir" -type f -name '*.schema.json' -print0)
done

echo "Schema validation results: $total_passed passed, $total_failures failed, $total_skipped skipped"

echo "" >> "$summary_file"
echo "### Golden Contract Validation Summary" >> "$summary_file"
echo "| Status | Count |" >> "$summary_file"
echo "|--------|-------|" >> "$summary_file"
echo "| ✅ Passed | $passed |" >> "$summary_file"
echo "| ❌ Failed | $failures |" >> "$summary_file"
echo "| ⚠️ Skipped | $skipped |" >> "$summary_file"


if [[ "$total_failures" -gt 0 ]]; then
  exit 1
fi
