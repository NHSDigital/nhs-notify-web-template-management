#!/bin/bash

# Fail fast on errors, unset variables, and pipeline failures.
set -euo pipefail

# Ensure build.sh is executable and build the lambda artifacts before producing the Docker image.
chmod +x ./build.sh
./build.sh


# Parse arguments
BASE_IMAGE=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --base-image)
      BASE_IMAGE="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$BASE_IMAGE" ]]; then
  echo "Error: --base-image parameter is required." >&2
  exit 1
fi

CSI="${project}-${environment}-${DOCKER_COMPONENT_NAME:-$component_name}"
ECR_REPO="${ECR_REPO:-nhs-notify-main-acct}"
GHCR_LOGIN_TOKEN="${GITHUB_TOKEN}"
GHCR_LOGIN_USER="${GITHUB_ACTOR}"
IMAGE_TAG_SUFFIX="${TF_VAR_image_tag_suffix}"
LAMBDA_NAME="${LAMBDA_NAME:-$(basename "$PWD")}"

# Ensure required AWS/ECR configuration is present.
echo "BASE_IMAGE: ${BASE_IMAGE:-<unset>}"
echo "aws_account_id: ${aws_account_id:-<unset>}"
echo "aws_region: ${region:-<unset>}"
echo "component_name: ${component_name:-<unset>}"
echo "CSI: ${CSI:-<unset>}"
echo "ECR_REPO: ${ECR_REPO:-<unset>}"
echo "environment: ${environment:-<unset>}"
echo "GHCR_LOGIN_TOKEN: ${GHCR_LOGIN_TOKEN:-<unset>}"
echo "GHCR_LOGIN_USER: ${GHCR_LOGIN_USER:-<unset>}"
echo "IMAGE_TAG_SUFFIX: ${IMAGE_TAG_SUFFIX:-<unset>}"
echo "LAMBDA_NAME: ${LAMBDA_NAME:-<unset>}"

# Authenticate Docker with AWS ECR using an ephemeral login token.
aws ecr get-login-password --region "${region}" | docker login --username AWS --password-stdin "${aws_account_id}".dkr.ecr."${region}".amazonaws.com

# Optionally authenticate to GitHub Container Registry for base images.
if [ -n "${GHCR_LOGIN_USER:-}" ] && [ -n "${GHCR_LOGIN_TOKEN:-}" ]; then
  echo "Attempting GHCR login as ${GHCR_LOGIN_USER}..."
  if echo "${GHCR_LOGIN_TOKEN}" | docker login ghcr.io --username "${GHCR_LOGIN_USER}" --password-stdin; then
    echo "GHCR login successful."
  else
    echo "GHCR login failed!" >&2
  fi
fi

# Namespace tag by CSI and lambda name to avoid cross-environment collisions.
IMAGE_TAG="${CSI}-${LAMBDA_NAME}-${IMAGE_TAG_SUFFIX}"

# Compose the full ECR image references.
ECR_REPO_URI="${aws_account_id}.dkr.ecr.${region}.amazonaws.com/${ECR_REPO}"
ECR_IMAGE="${ECR_REPO_URI}:${IMAGE_TAG}"
# Use only the first input argument for BASE_IMAGE_ARG (no fallback)

# Build and tag the Docker image for the lambda.
docker buildx build \
  -f docker/lambda/Dockerfile \
  --platform=linux/amd64 \
  --provenance=false \
  --sbom=false \
  --build-arg BASE_IMAGE="${BASE_IMAGE}" \
  -t "${ECR_IMAGE}" \
  .

# Push the image tag to ECR on apply only. The Terraform configuration will reference this tag for the lambda image.
if [ "${PUBLISH_LAMBDA_IMAGE:-false}" = "true" ]; then
  echo "PUBLISH_LAMBDA_IMAGE is set to true. Pushing Docker image to ECR: ${ECR_IMAGE}"
  docker push "${ECR_IMAGE}"
else
  echo "PUBLISH_LAMBDA_IMAGE is not set to true (we are most likely running in the context of a TF Plan). Skipping Docker push."
  exit 0
fi
