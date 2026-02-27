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
  src/letter-preview-renderer.ts

converter_py=$(node -e "console.log(require.resolve('carbone/lib/converter.py'))")
cp "$converter_py" ./dist/converter.py
