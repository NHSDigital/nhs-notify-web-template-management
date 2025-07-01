#!/bin/bash
set -euo pipefail

script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

service_dirs=("auth" "core" "templates")
pact_dirs=("consumer/.pacts" "provider/.pacts")
golden_dirs=("events/.schemas")

for service_dir in "${service_dirs[@]}"; do
  for pact_dir in "${pact_dirs[@]}"; do
    target="${script_path}/../tests/${service_dir}/${pact_dir}"
    if [ -d "$target" ]; then
      target_dir="$(realpath "${target}")"
      echo "Removing pact files in ${target_dir} ..."
      rm -rf $target_dir
    fi
  done

  for golden_dir in "${golden_dirs[@]}"; do
    target="${script_path}/../src/${service_dir}/${golden_dir}"
    if [ -d "$target" ]; then
      target_dir="$(realpath "${target}")"
      echo "Removing golden schema files in ${target_dir} ..."
      rm -rf $target_dir
    fi
  done
done

echo "All local contact files deleted successfully."
