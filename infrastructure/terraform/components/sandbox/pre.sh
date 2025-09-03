REGION=$1
ENVIRONMENT=$2
ACTION=$3

echo Running pre.sh
echo "REGION=$REGION"
echo "ENVIRONMENT=$ENVIRONMENT"
echo "ACTION=$ACTION"

if [ "${ACTION}" == "apply" ]; then
    echo "Building lambdas for distribution"

    if [ -z "$SKIP_SANDBOX_INSTALL" ]; then pnpm install; fi

    pnpm run generate-dependencies

    pnpm run lambda-build

    $(git rev-parse --show-toplevel)/lambdas/layers/pdfjs/build.sh
else
    echo "Skipping lambda build for action $ACTION"
fi
