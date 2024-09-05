# Locust Performance Tests

## AWS account Login

Login to AWS account and export the profile in console where you want to execute the test

e.g. if you want to trigger a test in dev2 environment
`export AWS_PROFILE=comms-mgr-dev2`
and then use login command
`aws sso login`

## Run via locust

You may compose a locust command with poetry directly:

`poetry run locust -H <BASEURL> <ENVIRONMENT>`

Where BASEURL is the URL for amplify and ENVIRONMENT is the name of environment where test will be executed.

However this is already available in the "run.sh" file. You can use below command to trigger a performance test:

`./run.sh <BASEURL> <ENVIRONMENT>`
e.g.  `./run.sh 'https://main.d1ie8muegpw33w.amplifyapp.com/templates' 'dev'`

This script will start a performance test in conosle.

If you do not want to run in headless mode, you may exclude additional argument which is passed to locust `--headless`, you may now open `http://localhost:8089` and start a test.

## create_nhsapp_template

This script is defined to create and submit a new template for NHSApp channel. This script is configured with think time of 5seconds to 10seconds between each transactions.
