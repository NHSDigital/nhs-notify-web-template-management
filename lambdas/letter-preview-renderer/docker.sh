#!/bin/bash

set -euo pipefail

./build.sh

: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${AWS_REGION:?AWS_REGION is required}"
: "${ECR_REPO:?ECR_REPO is required}"

GIT_SHA=$(git rev-parse --short HEAD)
if [ "${GITHUB_REF_TYPE:-}" = "tag" ] && [ -n "${GITHUB_REF_NAME:-}" ]; then
  IMAGE_TAG="${GITHUB_REF_NAME}"
else
  IMAGE_TAG="main-${GIT_SHA}"
fi

ECR_IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}"

BASE_IMAGE_ARG=${BASE_IMAGE:-ghcr.io/nhsdigital/nhs-notify/letter-renderer-node-22:latest}

docker build \
  -f docker/lambda/Dockerfile \
  --build-arg BASE_IMAGE="${BASE_IMAGE_ARG}" \
  -t "${ECR_IMAGE}" \
  .

docker push "${ECR_IMAGE}"
