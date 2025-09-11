echo "Running app pre.sh"

original_dir=$(pwd)

cd $(git rev-parse --show-toplevel)

make dependencies

npm run generate-dependencies --workspaces --if-present

npm run lambda-build --workspaces --if-present

$(git rev-parse --show-toplevel)/lambdas/layers/pdfjs/build.sh

cd $original_dir
