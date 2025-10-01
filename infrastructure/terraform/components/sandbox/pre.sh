REGION=$1
ENVIRONMENT=$2
ACTION=$3

# pre.sh runs in the same shell as terraform.sh, not in a subshell
# any variables set or changed, and change of directory will persist once this script exits and returns control to terraform.sh

echo "Running sandbox pre.sh"
echo "REGION=$REGION"
echo "ENVIRONMENT=$ENVIRONMENT"
echo "ACTION=$ACTION"

# change to monorepo root
cd $(git rev-parse --show-toplevel)

if [ "${ACTION}" == "apply" ]; then
    echo "Building lambdas for distribution"

    if [[ -z $SKIP_SANDBOX_INSTALL ]]; then
      echo "Installing dependencies"
      npm ci;
    else
      echo "Skipping dependency installation"
    fi

    npm run generate-dependencies --workspaces --if-present

    npm run lambda-build --workspaces --if-present

    lambdas/layers/pdfjs/build.sh
else
    echo "Skipping lambda build for action $ACTION"
fi

# revert back to original directory
cd -
