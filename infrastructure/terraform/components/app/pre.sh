root_dir=$(git rev-parse --show-toplevel)

npm ci

npm run generate-dependencies --workspaces --if-present

$root_dir/layers/pdfjs/package.sh
