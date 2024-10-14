#!/bin/bash

set -euo pipefail

amplify_outputs=$( jq ".auth.user_pool_id |= \"${USER_POOL_ID}\" | .auth.user_pool_client_id |= \"${USER_POOL_CLIENT_ID}\" | .auth.identity_pool_id |= \"${IDENTITY_POOL_ID}\"" "$(pwd)/amplify_outputs.json" )

echo $amplify_outputs > amplify_outputs.json
