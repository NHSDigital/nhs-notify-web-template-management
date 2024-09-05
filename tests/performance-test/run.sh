#!/bin/bash

TIMESTAMP=$(date +%Y_%m_%d_%H_%M_%S)

cd results
BASEURL=$1
exec poetry run locust --headless --host "$BASEURL" --users 1 --run-time 30s -f ../shared.py,../create_nhsapp_template.py --user-name="send" --password="messages" --html="report_$TIMESTAMP.html" --log-transactions-in-file --logfile="log_$TIMESTAMP.txt"
