if [ -z "$SKIP_SANDBOX_INSTALL" ]; then npm ci --omit=dev; fi

npm run generate-dependencies --workspaces --if-present
