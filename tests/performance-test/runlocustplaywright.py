import logging
import os

# Configure logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

# List the locust files you want to run concurrently
locust_files = "tests/NHSAppTemplateCreationJourney.py,tests/EmailTemplateCreationJourney.py,tests/SMSTemplateCreationJourney.py"

# Command to run Locust with specified files
command = f"poetry run locust -f {locust_files} --headless --users 3 --run-time 1m"

os.system(command)
