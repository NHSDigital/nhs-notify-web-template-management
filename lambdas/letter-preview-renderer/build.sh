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

cp ../../node_modules/carbone/lib/converter.py ./dist/converter.py
