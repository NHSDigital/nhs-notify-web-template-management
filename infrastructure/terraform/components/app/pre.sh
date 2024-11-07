#!/usr/bin/env bash

# build backend API lambdas

original_dir=$( pwd )

cd "$( git rev-parse --show-toplevel )/infrastructure/api"
npm ci
npm run build
echo "build succeeded"


cd $original_dir
echo "pre script finished $( pwd )"
