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
    --entry-names=[name]/[name] \
    --outdir=dist \
    --external:pdfjs-dist \
    src/templates/copy-scanned-object-to-internal.ts \
    src/templates/upload-letter.ts \
    src/templates/create.ts \
    src/templates/delete-failed-scanned-object.ts \
    src/templates/delete.ts \
    src/templates/get-client.ts \
    src/templates/get.ts \
    src/templates/list.ts \
    src/templates/process-proof.ts \
    src/templates/proof.ts \
    src/templates/set-letter-upload-virus-scan-status.ts \
    src/templates/submit.ts \
    src/templates/update.ts \
    src/templates/validate-letter-template-files.ts

cp -r ../../utils/utils/src/email-templates ./dist/submit
