# pre.sh runs in the same shell as terraform.sh, not in a subshell
# any variables set or changed, any change of directory will persist once this script exits and returns control to terraform.sh

echo "Running app pre.sh"

# change to monorepo root
cd $(git rev-parse --show-toplevel)

npm ci

npm run generate-dependencies --workspaces --if-present

export AWS_REGION="${TF_VAR_region}"
export AWS_ACCOUNT_ID="${TF_VAR_aws_account_id}"
export ECR_REPO="${TF_VAR_container_lambda_ecr_repo}"
export CSI="${TF_VAR_project}-${TF_VAR_environment}"
export SHORT_SHA="$(git rev-parse --short HEAD)"

export TF_VAR_letter_preview_renderer_image_tag="${TF_VAR_letter_preview_renderer_image_tag:-${CSI}-letter-preview-renderer-${SHORT_SHA}}"
echo "TF_VAR_letter_preview_renderer_image_tag: $TF_VAR_letter_preview_renderer_image_tag"

npm run lambda-build --workspaces --if-present

lambdas/layers/pdfjs/build.sh

# revert back to original directory
cd -
