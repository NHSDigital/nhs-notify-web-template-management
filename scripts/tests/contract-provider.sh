#!/usr/bin/env bash
set -euo pipefail

cd $(git rev-parse --show-toplevel)
npm --workspace tests/contracts/provider run test:contracts
