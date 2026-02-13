#!/bin/bash

# Fail fast on errors, unset variables, and pipeline failures.
set -euo pipefail

# Ensure build.sh is executable and build the lambda artifacts before producing the Docker image.
chmod +x ./build.sh
./build.sh

# Set Variables required for Docker Build.
BASE_IMAGE="${1:?BASE_IMAGE is required as the first argument}"
CSI="${project}-${environment}-${component_name}"
ECR_REPO="${ECR_REPO:-nhs-notify-main-acct}"
GHCR_LOGIN_TOKEN="${GITHUB_TOKEN}"
GHCR_LOGIN_USER="${GITHUB_ACTOR}"
IMAGE_TAG_SUFFIX="${TF_VAR_image_tag_suffix}"
LAMBDA_NAME="${LAMBDA_NAME:-$(basename "$(cd "$(dirname "$0")" && pwd)")}"
BUILD_PLATFORM="${BUILD_PLATFORM:-linux/amd64}"

# Ensure required AWS/ECR configuration is present.
echo "BASE_IMAGE: ${BASE_IMAGE:-<unset>}"
echo "aws_account_id: ${aws_account_id:-<unset>}"
echo "aws_region: ${region:-<unset>}"
echo "component_name: ${component_name:-<unset>}"
echo "CSI: ${CSI:-<unset>}"
echo "ECR_REPO: ${ECR_REPO:-<unset>}"
echo "environment: ${environment:-<unset>}"
if [ -n "${GHCR_LOGIN_TOKEN:-}" ]; then
  echo "GHCR_LOGIN_TOKEN: <set>"
else
  echo "GHCR_LOGIN_TOKEN: <unset>"
fi
echo "GHCR_LOGIN_USER: ${GHCR_LOGIN_USER:-<unset>}"
echo "IMAGE_TAG_SUFFIX: ${IMAGE_TAG_SUFFIX:-<unset>}"
echo "LAMBDA_NAME: ${LAMBDA_NAME:-<unset>}"
echo "BUILD_PLATFORM: ${BUILD_PLATFORM}"

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

# Build and tag the Docker image for the lambda.
BUILD_CMD=(
  docker build
  --pull
  --no-cache
  --platform "${BUILD_PLATFORM}"
  -f docker/lambda/Dockerfile
  --build-arg "BASE_IMAGE=${BASE_IMAGE}"
  -t "${ECR_IMAGE}"
  .
)

echo "Running build command: ${BUILD_CMD[*]}"
"${BUILD_CMD[@]}"

# Push the image tag to ECR on apply only. The Terraform configuration will reference this tag for the lambda image.
if [ "${PUBLISH_LAMBDA_IMAGE:-false}" = "true" ]; then
  echo "PUBLISH_LAMBDA_IMAGE is set to true. Pushing Docker image to ECR: ${ECR_IMAGE}"
  docker push "${ECR_IMAGE}"

  IMAGE_MANIFEST_MEDIA_TYPE="$(aws ecr batch-get-image \
    --repository-name "${ECR_REPO}" \
    --region "${region}" \
    --image-ids imageTag="${IMAGE_TAG}" \
    --query 'images[0].imageManifestMediaType' \
    --output text)"

  echo "Pushed image manifest media type: ${IMAGE_MANIFEST_MEDIA_TYPE}"

  if [ "${IMAGE_MANIFEST_MEDIA_TYPE}" = "application/vnd.docker.distribution.manifest.list.v2+json" ] || \
      [ "${IMAGE_MANIFEST_MEDIA_TYPE}" = "application/vnd.oci.image.index.v1+json" ]; then
      echo "ERROR: ECR tag ${ECR_IMAGE} is an image index, which is not supported by Lambda." >&2
      exit 1
  fi
else
  echo "PUBLISH_LAMBDA_IMAGE is not set to true (we are most likely running in the context of a TF Plan). Skipping Docker push."
  exit 0
fi
