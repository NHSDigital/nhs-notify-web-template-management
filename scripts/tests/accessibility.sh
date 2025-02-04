#!/bin/bash

set -euo pipefail

npm run build --prefix frontend

npm run app:start --prefix frontend

npm run app:wait --prefix frontend

npm run test:accessibility
