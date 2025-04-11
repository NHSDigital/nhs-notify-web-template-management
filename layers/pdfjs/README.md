# PDF.js Lambda Layer

Packages [`pdfjs-dist`](https://www.npmjs.com/package/pdfjs-dist) for use in AWS Lambda.

Packaged version is locked at `5.1.91`.

To use with a Lambda make sure you exclude `pdfjs-dist` from the bundled code.

## Build

Gets packaged using `package.sh` which is invoked in the Terraform `pre.sh` script.

This creates a zip archive at `dist/layer.zip` which is deployed via Terraform - [lambda_layer_version_pdfjs.tf](../../infrastructure/terraform/modules/backend-api/lambda_layer_version_pdfjs.tf)

## Caveats

PDF.js v4 and v5 has a dependency on `@napi-rs/canvas`, which gets installed alongside a platform-specific native binary. For AWS Lambda, the required binary is [linux/x86_64`](https://www.npmjs.com/package/@napi-rs/canvas-linux-x64-gnu) which can't be installed reliably locally (e.g. on a MacBook). Therefore the`package.json` for this layer lists the linux/x86_64 binary as an explicit dependency, and the installation is done using `npm install --force`.

Furthermore, this layer is not listed as an npm workspace in the root package.json in order to ensure that the dependencies are installed into the local `node_modules` directory, not the root `node_modules`
