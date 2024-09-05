#!/bin/bash

TIMESTAMP=$(date +%Y_%m_%d_%H_%M_%S)

export USERNAME=$(aws ssm get-parameter --name /template-mgmt/amplify-app/$2/amplify-repository-username --output json --with-decryption | jq -r .Parameter.Value)
export PASSWORD=$(aws ssm get-parameter --name /template-mgmt/amplify-app/$2/amplify-repository-password --output json --with-decryption | jq -r .Parameter.Value)

cd results
BASEURL=$1
exec poetry run locust --headless --host "$BASEURL" --users 1 --run-time 30s -f ../shared.py,../create_nhsapp_template.py --user-name=$USERNAME --password=$PASSWORD --html="report_$TIMESTAMP.html" --log-transactions-in-file --logfile="log_$TIMESTAMP.txt"
