#!/bin/bash

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

npm config --location user set @nhsdigital:registry https://npm.pkg.github.com

npm config ls -l | grep '/npm.pkg.github.com/:_authToken' -q && echo "Github token already exists" && exit 0

if [ -z "${GITHUB_PACKAGES_TOKEN:-}" ]; then
    read -p "Enter GitHub token: " GITHUB_PACKAGES_TOKEN
    export GITHUB_PACKAGES_TOKEN
fi

npm config --location user set //npm.pkg.github.com/:_authToken $GITHUB_PACKAGES_TOKEN
