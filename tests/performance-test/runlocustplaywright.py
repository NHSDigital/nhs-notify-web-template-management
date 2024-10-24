from locust import run_single_user, task, between
from locust_plugins.users.playwright import PageWithRetry, PlaywrightUser, PlaywrightScriptUser, pw, event
import time


class ScriptBased(PlaywrightScriptUser):
    # run a script that you recorded in playwright, exported as Python Async
    wait_time = between(1, 2)
    script = "test_playwrightpoc_async.py"
