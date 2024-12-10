#!/bin/bash

set -euo pipefail

echo "Creating Amplify sandbox"

if [[ ! -f amplify_outputs.json ]]; then
    echo "{}" >> amplify_outputs.json
fi

npm run create-sandbox -- --identifier "wf-${GITHUB_RUN_ID}" --outputs-out-dir ./frontend

# wait for Amplify outputs file to be available
wait_seconds=0
max_wait_seconds=600
wait_interval=1
expected_version=1.3
while [ $wait_seconds -le $max_wait_seconds ]; do
    amplify_outputs_version=$( jq -r ".version" frontend/amplify_outputs.json )

    if [[ $amplify_outputs_version == $expected_version  ]]; then
        echo "Amplify outputs file created"
        exit 0
    fi

    if [[ $amplify_outputs_version != 'null'  ]]; then
        echo "Amplify outputs file version is not expected '${amplify_outputs_version}'. Expected '${expected_version}'"
        break
    fi

    echo "Amplify outputs file not found after ${wait_seconds} seconds. Waiting ${wait_interval} seconds and polling again"

    sleep $wait_interval
    wait_seconds=$(($wait_seconds + $wait_interval))
done

npx pm2 logs npx --lines all --nostream

echo "Amplify outputs file not found after ${wait_seconds} seconds. Failing job"
exit 1
