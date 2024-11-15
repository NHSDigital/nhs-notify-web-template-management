import logging
import os
import subprocess

# Configure logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

# List the Locust files you want to run concurrently
locust_files = "tests/NHSAppTemplateCreationJourney.py,tests/EmailTemplateCreationJourney.py,tests/SMSTemplateCreationJourney.py"

# Command to run Locust with specified files
command = f"poetry run locust -f {locust_files} --headless --users 3 --run-time 30s --csv=results"

# Run the Locust test
locust_exit_code = os.system(command)

# Check if Locust test completed successfully
if locust_exit_code == 0:
    # Run results_pass_fail.py if Locust test succeeded
        subprocess.run(["python", "helpers/results_pass_fail.py"])
else:
    logger.error("Locust test failed to run. Skipping results_pass_fail.py execution.")
