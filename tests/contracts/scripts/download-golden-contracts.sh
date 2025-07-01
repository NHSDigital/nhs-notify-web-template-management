#!/bin/bash
set -euo pipefail

script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

test_root="$( realpath "${script_path}/../tests" )"

for consumer_dir in "$test_root"/*/consumer; do
  config="$consumer_dir/config.json"

  consumer_name=$(basename "$(dirname "$consumer_dir")")

  if [[ ! -f "$config" ]]; then
    echo "No config.json in $consumer_dir — skipping"
    continue
  fi

  echo "Reading config for consumer: $consumer_name"

  providers=$(jq -r '.providers | keys[]' "$config")


  for provider in $providers; do
    events=$(jq -r ".providers[\"$provider\"][]" "$config")

    for event in $events; do
      filename="${event}.schema.json"
      s3_path="s3://$PACT_BUCKET/golden/$provider/$filename"
      local_dir="$consumer_dir/.schemas/$provider"

      mkdir -p "$local_dir"

      echo "Consumer \"${consumer_name}\" needs \"${event}\" event from provider \"${provider}\" - downloading..."
      if aws s3 cp "$s3_path" "$local_dir/$filename" --quiet; then
        echo "Downloaded ${s3_path} to ${local_dir}/${filename}"
      else
        echo "Failed to download ${s3_path}"
      fi
    done
  done
done

echo "Downloaded golden contracts for all consumers"
