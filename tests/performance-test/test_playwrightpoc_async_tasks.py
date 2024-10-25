import asyncio
import nest_asyncio
from locust import HttpUser, SequentialTaskSet, task, between
from playwright.async_api import async_playwright

# Apply nest_asyncio to avoid "event loop is already running" errors
nest_asyncio.apply()

class UserTasks(SequentialTaskSet):
    def __init__(self, parent):
        super().__init__(parent)
        self.browser = None
        self.context = None
        self.page = None

    async def on_start(self):
        # This is executed when a simulated user starts.
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=False)  # Launch the browser
        self.context = await self.browser.new_context()  # Create a new browser context
        self.page = await self.context.new_page()  # Open a new page

    def on_stop(self):
        # Synchronously stop Playwright when the user simulation stops
        asyncio.run(self.stop_playwright())

    async def stop_playwright(self):
        # This is executed when a simulated user stops.
        await self.context.close()
        await self.browser.close()
        await self.playwright.stop()

    @task
    async def step_one(self):
        # Task to navigate to the URL
        await self.page.goto("https://main.web-gateway.dev.nhsnotify.national.nhs.uk/templates/create-and-submit-templates")

    @task
    async def step_two(self):
        # Task to click on link button
        await self.page.get_by_test_id("link-button").click()

    @task
    async def step_three(self):
        # Task to check NHS App radio and fill in the form
        await self.page.get_by_test_id("NHS_APP-radio").check()
        await self.page.get_by_test_id("submit-button").click()
        await self.page.get_by_label("Template name").click()
        await self.page.get_by_label("Template name").fill("PerformanceTest")
        await self.page.get_by_label("Message").click()
        await self.page.get_by_label("Message").fill("PerformanceTest")
        await self.page.get_by_role("button", name="Continue").click()
        await self.page.get_by_test_id("nhsapp-submit-radio").check()
        await self.page.get_by_test_id("submit-button").click()
        await self.page.get_by_role("button", name="Submit template").click()

class PlaywrightScriptUser(HttpUser):
    host = "https://main.web-gateway.dev.nhsnotify.national.nhs.uk"
    tasks = [UserTasks]
    wait_time = between(1, 5)  # Wait time between task executions

# If you need to run the script independently (for debugging):
if __name__ == "__main__":
    asyncio.run(async_playwright().start())
