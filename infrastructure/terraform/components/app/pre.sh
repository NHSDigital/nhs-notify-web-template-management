# pre.sh runs in the same shell as terraform.sh, not in a subshell
# any variables set or changed, any change of directory will persist once this script exits and returns control to terraform.sh
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

# pre.sh runs in the same shell as terraform.sh, not in a subshell
# any variables set or changed, and change of directory will persist once this script exits and returns control to terraform.sh

echo "Running app pre.sh"
echo "ACTION=$ACTION"
echo "component_name=$component_name"
echo "project=$project"
echo "aws_account_id=$aws_account_id"
echo "environment=$environment"
echo "region=$region"

# Export values so subprocesses (e.g. npm run lambda-build -> docker.sh) can access them.
export component_name project aws_account_id environment region

# change to monorepo root
cd $(git rev-parse --show-toplevel)

## Set TF_VAR_image_tag_suffix based on git tag or short SHA for unique lambda image tagging in ECR.
#This ensures that each build produces a uniquely identifiable image, and tagged releases are easily traceable.
echo "Checking if current commit is a tag..."
GIT_TAG="$(git describe --tags --exact-match 2>/dev/null || true)"
if [ -n "$GIT_TAG" ]; then
  TAGGED="tag-$GIT_TAG"
  echo "On tag: $GIT_TAG, exporting TF_VAR_image_tag_suffix as tag: $TAGGED"
  export TF_VAR_image_tag_suffix="$TAGGED"

else
  SHORT_SHA="sha-$(git rev-parse --short HEAD)"
  echo "Not on a tag, exporting TF_VAR_image_tag_suffix as short SHA: $SHORT_SHA"
  export TF_VAR_image_tag_suffix="$SHORT_SHA"
fi

echo "Checking if ACTION is 'apply' to set PUBLISH_LAMBDA_IMAGE..."
if [ "$ACTION" = "apply" ]; then
  echo "Setting PUBLISH_LAMBDA_IMAGE to true for apply action"
  export PUBLISH_LAMBDA_IMAGE="true"
else
  echo "Not setting PUBLISH_LAMBDA_IMAGE for action ($ACTION)"
fi


run_or_fail npm ci
run_or_fail npm run generate-dependencies --workspaces --if-present
run_or_fail npm run lambda-build --workspaces --if-present
run_or_fail lambdas/layers/pdfjs/build.sh

# revert back to original directory
cd -
