# pre.sh runs in the same shell as terraform.sh, not in a subshell
# any variables set or changed, any change of directory will persist once this script exits and returns control to terraform.sh

echo "Running app pre.sh"

# change to monorepo root
cd $(git rev-parse --show-toplevel)

npm ci

npm run generate-dependencies --workspaces --if-present

export TF_VAR_short_sha="$(git rev-parse --short HEAD)"

if [ "$TF_ACTION" = "apply" ]; then
  echo "Setting PUBLISH_LAMBDA_IMAGE to true for apply action"
  export PUBLISH_LAMBDA_IMAGE="true"
else
  echo "Not setting PUBLISH_LAMBDA_IMAGE for non-apply action (e.g. plan)"
fi

npm run lambda-build --workspaces --if-present

lambdas/layers/pdfjs/build.sh

# revert back to original directory
cd -
