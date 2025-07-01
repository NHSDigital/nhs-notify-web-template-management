#!/bin/bash
set -euo pipefail

script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
root_path="$(realpath "$script_path/..")"

for service_dir in "$root_path/src" "$root_path/tests"; do
  if [[ -d "$service_dir" ]]; then
    find "$service_dir" -type d \( -name '.pacts' -o -name '.schemas' \) | while read -r dir; do
      abs_path="$(realpath "$dir")"
      echo "Removing $abs_path"
      rm -rf "$abs_path"
    done
  fi
done

echo "All local contract files deleted successfully"
