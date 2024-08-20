# Locust Performance Tests

Run via locust

You may compose a locust command with poetry directly:

```
poetry run locust -H 'https://main.d1ie8muegpw33w.amplifyapp.com'
```

However this is already available in the :

```
./run.sh
```

This script will start a performance test in conosle.

If you do not want to run in headless mode, you may exclude additional argument which is passed to locust `--headless`, you may now open `http://localhost:8089` and start a test.

## create_nhsapp_template

This script is defined to create and submit a new template for NHSApp channel. This script is configured with think time of 5seconds to 10seconds between each transactions. 
