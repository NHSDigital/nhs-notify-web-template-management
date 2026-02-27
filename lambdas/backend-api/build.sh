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
    src/copy-scanned-object-to-internal.ts \
    src/count-routing-configs.ts \
    src/create-routing-config.ts \
    src/create.ts \
    src/delete-failed-scanned-object.ts \
    src/delete.ts \
    src/delete-routing-config.ts \
    src/get-client.ts \
    src/get-letter-variant.ts \
    src/get-routing-config.ts \
    src/get-routing-configs-by-template-id.ts \
    src/get-template-letter-variants.ts \
    src/get.ts \
    src/list-routing-configs.ts \
    src/list.ts \
    src/patch-template.ts \
    src/process-proof.ts \
    src/proof.ts \
    src/set-letter-upload-virus-scan-status.ts \
    src/submit-routing-config.ts \
    src/submit.ts \
    src/update-routing-config.ts \
    src/update.ts \
    src/upload-docx-letter.ts \
    src/upload-letter.ts \
    src/validate-letter-template-files.ts

cp -r ../../utils/utils/src/email-templates ./dist/submit
