# pre.sh runs in the same shell as terraform.sh, not in a subshell
# any variables set or changed, and change of directory will persist once this script exits and returns control to terraform.sh
REGION=$1
ENVIRONMENT=$2
ACTION=$3

# Helper function for error handling
run_or_fail() {
  "$@"
  if [ $? -ne 0 ]; then
    echo "$* failed!" >&2
    exit 1
  fi
}

echo "Running sandbox pre.sh"
echo "REGION=$REGION"
echo "ENVIRONMENT=$ENVIRONMENT"
echo "ACTION=$ACTION"

# change to monorepo root
cd $(git rev-parse --show-toplevel)

case "${ACTION}" in
  apply)
    unset TF_VAR_use_dummy_container_image_uri
    echo "Building lambdas for distribution"

    if [[ -z $SKIP_SANDBOX_INSTALL ]]; then
      echo "Installing dependencies"
      run_or_fail npm ci;
    else
      echo "Skipping dependency installation"
    fi

    run_or_fail npm run generate-dependencies --workspaces --if-present
    run_or_fail npm run lambda-build --workspaces --if-present
    run_or_fail lambdas/layers/pdfjs/build.sh
    ;;
  plan)
    export TF_VAR_use_dummy_container_image_uri=true
    echo "Skipping lambda build for action $ACTION"
    ;;
  *)
    unset TF_VAR_use_dummy_container_image_uri
    echo "Skipping lambda build for action $ACTION"
    ;;
esac

# revert back to original directory
cd -
