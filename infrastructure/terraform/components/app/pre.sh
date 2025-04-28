npm ci

npm run generate-dependencies --workspaces --if-present

top_level=$(git rev-parse --show-toplevel)
pdfjs_zip=${top_level}/lambdas/layers/pdfjs/dist/layer/pdfjs-layer.zip

if [ ! -f "$pdfjs_zip" ]; then
    ${top_level}/lambdas/layers/pdfjs/build.sh
fi
