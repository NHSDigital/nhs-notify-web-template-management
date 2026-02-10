# pre.sh runs in the same shell as terraform.sh, not in a subshell
# any variables set or changed, any change of directory will persist once this script exits and returns control to terraform.sh

echo "Running app pre.sh"

# change to monorepo root
cd $(git rev-parse --show-toplevel)

npm ci

npm run generate-dependencies --workspaces --if-present

export AWS_REGION="${AWS_REGION:-${TF_VAR_region:-}}"
export AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-${TF_VAR_aws_account_id:-}}"
export ECR_REPO="${ECR_REPO:-${TF_VAR_letter_preview_renderer_ecr_repo:-nhs-notify-main-acct}}"
export CSI="${CSI:-${TF_VAR_project:-}-${TF_VAR_environment:-}-${TF_VAR_component:-}}"
CSI="${CSI//_/}"
export CSI

npm run lambda-build --workspaces --if-present

lambdas/layers/pdfjs/build.sh

# revert back to original directory
cd -
