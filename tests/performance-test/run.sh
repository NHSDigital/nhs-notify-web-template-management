#!/bin/bash

TIMESTAMP=$(date +%Y_%m_%d_%H_%M_%S)

cd results
exec poetry run locust --users 1 --run-time 30s -H 'https://main.d1ie8muegpw33w.amplifyapp.com' -f ../shared.py,../create_nhsapp_template.py --class-picker $*  --user-name='send' --password='messages' --html="report_$TIMESTAMP.html" --log-transactions-in-file --logfile="log_$TIMESTAMP.txt" 
