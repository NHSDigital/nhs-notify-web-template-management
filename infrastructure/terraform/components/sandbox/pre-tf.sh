if [ -z "$SKIP_SANDBOX_INSTALL" ]; then npm ci; fi

npm run generate-dependencies --workspaces --if-present

npm run lambda-build --workspaces --if-present

$(git rev-parse --show-toplevel)/lambdas/layers/pdfjs/build.sh
