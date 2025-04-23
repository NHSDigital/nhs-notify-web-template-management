npm ci

npm run generate-dependencies --workspaces --if-present

./lambdas/layers/pdfjs/build.sh
