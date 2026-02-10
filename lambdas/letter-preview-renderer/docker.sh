#!/bin/bash

# Fail fast on errors, unset variables, and pipeline failures.
set -euo pipefail

# Build the lambda artifacts before producing the Docker image.
./build.sh

# Ensure required AWS/ECR configuration is present.
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${AWS_REGION:?AWS_REGION is required}"
: "${ECR_REPO:?ECR_REPO is required}"
: "${CSI:?CSI is required}"
LAMBDA_NAME="${LAMBDA_NAME:-letter-preview-renderer}"

# Authenticate Docker with AWS ECR using an ephemeral login token.
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}".dkr.ecr."${AWS_REGION}".amazonaws.com

# Optionally authenticate to GitHub Container Registry for base images.
if [ -n "${GHCR_LOGIN_USER:-}" ] && [ -n "${GHCR_LOGIN_TOKEN:-}" ]; then
  echo "${GHCR_LOGIN_TOKEN}" | docker login ghcr.io --username "${GHCR_LOGIN_USER}" --password-stdin
fi

# Resolve git references for image tags.
# Namespace tag by CSI and lambda name to avoid cross-environment collisions.
IMAGE_TAG_LATEST="${CSI}-${LAMBDA_NAME}-latest"

# Compose the full ECR image references.
ECR_REPO_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
ECR_IMAGE_LATEST="${ECR_REPO_URI}:${IMAGE_TAG_LATEST}"

# Allow an override for the base image used in the Docker build.
BASE_IMAGE_ARG=${BASE_IMAGE:-ghcr.io/nhsdigital/nhs-notify/letter-renderer-node-22:latest}

# Build and tag the Docker image for the lambda.
docker build \
  -f docker/lambda/Dockerfile \
  --build-arg BASE_IMAGE="${BASE_IMAGE_ARG}" \
  -t "${ECR_IMAGE_LATEST}" \
  .

# Push the image tag to ECR.
docker push "${ECR_IMAGE_LATEST}"
