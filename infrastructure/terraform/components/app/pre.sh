root_dir=$(git rev-parse --show-toplevel)

npm ci

npm run generate-dependencies --workspaces --if-present

$root_dir/lambdas/layers/pdfjs/build.sh
