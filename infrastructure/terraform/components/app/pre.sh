npm ci

npm run generate-dependencies --workspaces --if-present
find ./lambdas -maxdepth 3
./lambdas/layers/pdfjs/build.sh
