#!/bin/bash

# Fail fast on errors, unset variables, and pipeline failures.
set -euo pipefail

# Ensure build.sh is executable and build the lambda artifacts before producing the Docker image.
chmod +x ./build.sh
./build.sh

AWS_REGION="${AWS_REGION:-eu-west-2}"
ECR_REPO="${ECR_REPO:-nhs-notify-main-acct}"
CSI="nhs-notify-${ENVIRONMENT}"
LAMBDA_NAME="${LAMBDA_NAME:-$(basename "$(cd "$(dirname "$0")" && pwd)")}"
SHORT_SHA="${SHORT_SHA:-$(git rev-parse --short HEAD)}"
GHCR_LOGIN_USER="${GITHUB_ACTOR}"
GHCR_LOGIN_TOKEN="${GITHUB_TOKEN}"

# Ensure required AWS/ECR configuration is present.
echo "AWS_ACCOUNT_ID: ${AWS_ACCOUNT_ID:-<unset>}"
echo "AWS_REGION: ${AWS_REGION:-<unset>}"
echo "ECR_REPO: ${ECR_REPO:-<unset>}"
echo "ENVIRONMENT: ${ENVIRONMENT:-<unset>}"
echo "CSI: ${CSI:-<unset>}"
echo "LAMBDA_NAME: ${LAMBDA_NAME:-<unset>}"
echo "SHORT_SHA: ${SHORT_SHA:-<unset>}"
echo "GHCR_LOGIN_USER: ${GHCR_LOGIN_USER:-<unset>}"
echo "GHCR_LOGIN_TOKEN: ${GHCR_LOGIN_TOKEN:-<unset>}"

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
IMAGE_TAG_LATEST="${CSI}-${LAMBDA_NAME}-${SHORT_SHA}"

# Compose the full ECR image references.
ECR_REPO_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
ECR_IMAGE_LATEST="${ECR_REPO_URI}:${IMAGE_TAG_LATEST}"

# Use only the first input argument for BASE_IMAGE_ARG (no fallback)
BASE_IMAGE_ARG="$1"

# Build and tag the Docker image for the lambda.
docker build \
  -f docker/lambda/Dockerfile \
  --build-arg BASE_IMAGE="${BASE_IMAGE_ARG}" \
  -t "${ECR_IMAGE_LATEST}" \
  .

# Push the image tag to ECR. The Terraform configuration will reference this tag for the lambda image.
docker push "${ECR_IMAGE_LATEST}"
