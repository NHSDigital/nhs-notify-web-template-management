#!/bin/bash

# Fail fast on errors, unset variables, and pipeline failures.
set -euo pipefail

# Ensure build.sh is executable and build the lambda artifacts before producing the Docker image.
chmod +x ./build.sh
./build.sh


AWS_REGION="${REGION}"
COMPONENT="${COMPONENT}"
CSI="nhs-notify-${ENVIRONMENT}-${COMPONENT}"
ECR_REPO="${ECR_REPO:-nhs-notify-main-acct}"
GHCR_LOGIN_TOKEN="${GITHUB_TOKEN}"
GHCR_LOGIN_USER="${GITHUB_ACTOR}"
IMAGE_TAG_SUFFIX="${TF_VAR_image_tag_suffix}"
LAMBDA_NAME="${LAMBDA_NAME:-$(basename "$(cd "$(dirname "$0")" && pwd)")}"

# Ensure required AWS/ECR configuration is present.
echo "AWS_ACCOUNT_ID: ${AWS_ACCOUNT_ID:-<unset>}"
echo "AWS_REGION: ${AWS_REGION:-<unset>}"
echo "COMPONENT: ${COMPONENT:-<unset>}"
echo "CSI: ${CSI:-<unset>}"
echo "ECR_REPO: ${ECR_REPO:-<unset>}"
echo "ENVIRONMENT: ${ENVIRONMENT:-<unset>}"
echo "GHCR_LOGIN_TOKEN: ${GHCR_LOGIN_TOKEN:-<unset>}"
echo "GHCR_LOGIN_USER: ${GHCR_LOGIN_USER:-<unset>}"
echo "IMAGE_TAG_SUFFIX: ${IMAGE_TAG_SUFFIX:-<unset>}"
echo "LAMBDA_NAME: ${LAMBDA_NAME:-<unset>}"

# Authenticate Docker with AWS ECR using an ephemeral login token.
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}".dkr.ecr."${AWS_REGION}".amazonaws.com

# Optionally authenticate to GitHub Container Registry for base images.
if [ -n "${GHCR_LOGIN_USER:-}" ] && [ -n "${GHCR_LOGIN_TOKEN:-}" ]; then
  echo "Attempting GHCR login as ${GHCR_LOGIN_USER}..."
  if echo "${GHCR_LOGIN_TOKEN}" | docker login ghcr.io --username "${GHCR_LOGIN_USER}" --password-stdin; then
    echo "GHCR login successful."
  else
    echo "GHCR login failed!" >&2
  fi
fi

# Resolve git references for image tags.
# Namespace tag by CSI and lambda name to avoid cross-environment collisions.
IMAGE_TAG="${CSI}-${LAMBDA_NAME}-${IMAGE_TAG_SUFFIX}"

# Compose the full ECR image references.
ECR_REPO_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
ECR_IMAGE="${ECR_REPO_URI}:${IMAGE_TAG}"
# Use only the first input argument for BASE_IMAGE_ARG (no fallback)
BASE_IMAGE_ARG="$1"

# Build and tag the Docker image for the lambda.
docker buildx build \
  -f docker/lambda/Dockerfile \
  --build-arg BASE_IMAGE="${BASE_IMAGE_ARG}" \
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
