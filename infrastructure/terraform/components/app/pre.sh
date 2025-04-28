npm ci

npm run generate-dependencies --workspaces --if-present
ls -la ./lambdas
ls -la "lambdas/layers/"

ls -la "lambdas/layers/pdfjs/" 2>/dev/null || echo "pdfjs directory not found"
./lambdas/layers/pdfjs/build.sh
