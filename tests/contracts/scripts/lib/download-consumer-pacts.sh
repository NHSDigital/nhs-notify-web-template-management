function download_consumer_pacts {
  local provider=$1

  script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
  contract_tests_root_dir=$(realpath "${script_path}/../..")
  target_dir="${contract_tests_root_dir}/tests/${provider}/provider/pacts"

  rm -rf $target_dir
  mkdir -p "$target_dir"

  aws s3 sync "s3://$PACT_BUCKET/pacts/$provider/" "$target_dir/" \
    --exclude "*" \
    --include "*.json" 1>/dev/null

  find "$target_dir" -maxdepth 1 -name '*.json' -type f | wc -l | xargs
}
