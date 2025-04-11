#!/bin/bash

set -euo pipefail

cd $(realpath $(dirname $0))
rm -rf dist/layer node_modules
mkdir -p dist/layer/nodejs/node_modules
npm install --force
cp -r node_modules/* dist/layer/nodejs/node_modules
cd dist/layer
zip -r ../layer.zip nodejs
cd ../../
rm -rf dist/layer node_modules
