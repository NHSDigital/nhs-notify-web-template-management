REGION=$1
ENVIRONMENT=$2
ACTION=$3

echo "Running pre.sh"
echo "REGION=$REGION"
echo "ENVIRONMENT=$ENVIRONMENT"
echo "ACTION=$ACTION"

cd $(git rev-parse --show-toplevel)

if [ "${ACTION}" == "apply" ]; then
    echo "Building lambdas for distribution"

    if [[ -z $SKIP_SANDBOX_INSTALL ]]; then
      echo "Installing dependencies"
      make dependencies;
    else
      echo "Skipping dependency installation"
    fi

    npm run generate-dependencies --workspaces --if-present

    npm run lambda-build --workspaces --if-present

    $(git rev-parse --show-toplevel)/lambdas/layers/pdfjs/build.sh
else
    echo "Skipping lambda build for action $ACTION"
fi

cd -
