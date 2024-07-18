#!/bin/bash

set -euo pipefail

#!/bin/bash

set -euo pipefail

echo "Creating sandbox"

npm run create-sandbox -- --profile comms-dev-2-admin

# wait for Amplify outputs file to be available
wait_seconds=0
max_wait_seconds=600
wait_interval=10
while [ $wait_seconds -le $max_wait_seconds ]; do
    amplify_outputs_version=$( jq -r ".version" amplify_outputs.json )

    if [[ $amplify_outputs_version == '1' ]]; then
        echo "Amplify outputs file created"
        exit 0
    fi

    echo "Amplify outputs file not found after ${wait_seconds} seconds. Waiting ${wait_interval} seconds and polling again"

    sleep $wait_interval
    wait_seconds=$(($wait_seconds + $wait_interval))
done


cat ~/.pm2/logs/npx-out.log
echo "Amplify outputs file not found after ${wait_seconds} seconds. Failing job"
exit 1
