echo "Running app pre.sh"

pnpm install

pnpm run generate-dependencies

pnpm run lambda-build

$(git rev-parse --show-toplevel)/lambdas/layers/pdfjs/build.sh
