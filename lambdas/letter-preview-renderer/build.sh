#!/bin/bash

set -euo pipefail

rm -rf dist

npx esbuild \
  --bundle \
  --minify \
  --sourcemap \
  --target=es2020 \
  --platform=node \
  --loader:.node=file \
  --entry-names=[name] \
  --outdir=dist \
  src/index.ts

cp ./node_modules/carbone/lib/converter.py ./dist/converter.py
cp ./doc.docx ./dist/doc.docx
