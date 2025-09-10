#!/usr/bin/env bash
set -euo pipefail

# replicate https://playwright.dev/docs/test-sharding

# 1) Run 4 shards in parallel
pids=()
for s in 1 2 3 4; do
  export SHARD_ID="$s"
  export PLAYWRIGHT_BLOB_OUTPUT_FILE="blob-report/shard-$s.zip"
  npx playwright test --config config/component/component.config.ts --project='component' --shard="$s/4"  --output="playwright-report/shard-$s"  &
  pids+=($!)
done

# Collect exit codes
fail=0
for pid in "${pids[@]}"; do
  wait "$pid" || fail=1
done

npx playwright merge-reports --reporter html ./blob-report


exit $fail
