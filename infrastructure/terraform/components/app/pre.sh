# pre.sh runs in the same shell as terraform.sh, not in a subshell
# any variables set or changed, any change of directory will persist once this script exits and returns control to terraform.sh
REGION=$1
ENVIRONMENT=$2
ACTION=$3

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

npm ci

npm run generate-dependencies --workspaces --if-present


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
  echo "Not setting PUBLISH_LAMBDA_IMAGE for non-apply action (e.g. plan)"
fi


if [ "$ACTION" = "apply" ]; then
  echo "Setting PUBLISH_LAMBDA_IMAGE to true for apply action"
  export PUBLISH_LAMBDA_IMAGE="true"
else
  echo "Not setting PUBLISH_LAMBDA_IMAGE for non-apply action (e.g. plan)"
fi

npm run lambda-build --workspaces --if-present
if [ $? -ne 0 ]; then
  echo "npm run lambda-build failed!" >&2
  exit 1
fi

lambdas/layers/pdfjs/build.sh

# revert back to original directory
cd -
