import os

# List the locust files you want to run concurrently
locust_files = "NHSAppTemplateCreationJourney.py,EmailTemplateCreationJourney.py,SMSTemplateCreationJourney.py"

# Command to run Locust with specified files
command = f"poetry run locust -f {locust_files} --users 3 --run-time 300"

# Execute the command
os.system(command)
