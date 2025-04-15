root_dir=$(git rev-parse --show-toplevel)

if [ -z "$SKIP_SANDBOX_INSTALL" ]; then npm ci; fi

npm run generate-dependencies --workspaces --if-present

$root_dir/lambdas/layers/pdfjs/package.sh
