#!/bin/bash
set -euo pipefail

script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

dirs=("consumer" "consumer-2" "producer")

for dir in "${dirs[@]}"; do
  pact_dir="$(realpath "${script_path}/../${dir}")/pacts"

  echo "Removing pact files in $pact_dir..."

  rm -rf $pact_dir
done

echo "All Pact files deleted successfully."
