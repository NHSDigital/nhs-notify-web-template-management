#!/bin/bash

set -euo pipefail

app_id=$1
branch_name=$2

wait_interval=30
max_wait_seconds=600

# wait for Amplify job to be available
wait_seconds=0
while [ $wait_seconds -le $max_wait_seconds ]; do
    job_id=$( aws amplify list-jobs --app-id $app_id --branch-name $branch_name | jq -r '.jobSummaries[0].jobId' || true )

    if [[ $job_id != '' ]]; then
        echo "Job ID found: |${job_id}|"
        break
    fi

    echo "Job not found after ${wait_seconds} seconds. Waiting ${wait_interval} seconds and polling again"

    sleep $wait_interval
    wait_seconds=$(($wait_seconds + $wait_interval))
done

# wait for Amplify job to finish
wait_seconds=0
while [ $wait_seconds -le $max_wait_seconds ]; do
    job_status=$( aws amplify get-job --app-id $app_id --branch-name $branch_name --job-id $job_id | jq -r '.job.summary.status' )

    if [ $job_status == "SUCCEED" ]; then
        echo "Job succeeded"
        exit 0
    fi

    if [ $job_status == "FAILED" ]; then
        echo "Job failed"
        exit 1
    fi

    echo "Job not completed after ${wait_seconds} seconds. Status is ${job_status}. Waiting ${wait_interval} seconds and polling again"

    sleep $wait_interval
    wait_seconds=$(($wait_seconds + $wait_interval))
done

echo "Job took longer than 10 minutes to run"
exit 1
