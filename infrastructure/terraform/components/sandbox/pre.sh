REGION=$1
ENVIRONMENT=$2
ACTION=$3

echo Running pre.sh
echo "REGION=$REGION"
echo "ENVIRONMENT=$ENVIRONMENT"
echo "ACTION=$ACTION"

if [ "$ACTION" == "apply"]; then
    if [ -z "$SKIP_SANDBOX_INSTALL" ]; then npm ci; fi

    npm run generate-dependencies --workspaces --if-present

    npm run lambda-build --workspaces --if-present

    $(git rev-parse --show-toplevel)/lambdas/layers/pdfjs/build.sh
fi
