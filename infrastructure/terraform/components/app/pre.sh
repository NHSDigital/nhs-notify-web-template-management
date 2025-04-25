npm ci

npm run generate-dependencies --workspaces --if-present

./layers/pdfjs/build.sh
