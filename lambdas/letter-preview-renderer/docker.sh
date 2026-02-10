#!/bin/bash

# Fail fast on errors, unset variables, and pipeline failures.
set -euo pipefail

# Build the lambda artifacts before producing the Docker image.
./build.sh

# Ensure required AWS/ECR configuration is present.
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${AWS_REGION:?AWS_REGION is required}"
: "${ECR_REPO:?ECR_REPO is required}"

# Authenticate Docker with AWS ECR using an ephemeral login token.
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}".dkr.ecr."${AWS_REGION}".amazonaws.com

# Optionally authenticate to GitHub Container Registry for base images.
if [ -n "${GHCR_LOGIN_USER:-}" ] && [ -n "${GHCR_LOGIN_TOKEN:-}" ]; then
  echo "${GHCR_LOGIN_TOKEN}" | docker login ghcr.io --username "${GHCR_LOGIN_USER}" --password-stdin
fi

# Resolve the image tag: prefer a GitHub tag, otherwise use main-<short-sha>.
GIT_SHA=$(git rev-parse --short HEAD)
if [ "${GITHUB_REF_TYPE:-}" = "tag" ] && [ -n "${GITHUB_REF_NAME:-}" ]; then
  IMAGE_TAG="${GITHUB_REF_NAME}"
else
  IMAGE_TAG="main-${GIT_SHA}"
fi

# Compose the full ECR image reference.
ECR_IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}"

# Allow an override for the base image used in the Docker build.
BASE_IMAGE_ARG=${BASE_IMAGE:-ghcr.io/nhsdigital/nhs-notify/letter-renderer-node-22:latest}

# Build and tag the Docker image for the lambda.
docker build \
  -f docker/lambda/Dockerfile \
  --build-arg BASE_IMAGE="${BASE_IMAGE_ARG}" \
  -t "${ECR_IMAGE}" \
  .

# Push the image to ECR.
docker push "${ECR_IMAGE}"
