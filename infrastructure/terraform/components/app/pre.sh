npm ci

npm run generate-dependencies --workspaces --if-present

top_level=$(git rev-parse --show-toplevel)
pdfjs_zip=${top_level}/lambdas/layers/pdfjs/dist/pdfjs-layer.zip

if ! find "$pdfjs_zip" -mmin -60 -print -quit | grep -q '^'; then
    ${top_level}/lamdbas/layers.pdfjs/build.sh
fi
