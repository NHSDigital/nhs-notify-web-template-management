REGION=$1
ENVIRONMENT=$2
ACTION=$3

echo Running pre.sh
echo "REGION=$REGION"
echo "ENVIRONMENT=$ENVIRONMENT"
echo "ACTION=$ACTION"


if [ "${ACTION}" == "apply" ]; then
    original_dir=$(pwd)
    cd $(git rev-parse --show-toplevel)
    echo "Building lambdas for distribution"

    if [ -z "$SKIP_SANDBOX_INSTALL" ]; then make dependencies; fi

    npm run generate-dependencies --workspaces --if-present

    npm run lambda-build --workspaces --if-present

    $(git rev-parse --show-toplevel)/lambdas/layers/pdfjs/build.sh

    cd $original_dir
else
    echo "Skipping lambda build for action $ACTION"
fi
