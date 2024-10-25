import asyncio
import nest_asyncio
from locust import task
from playwright.async_api import async_playwright

# Apply nest_asyncio to avoid "event loop is already running" errors
nest_asyncio.apply()

async def run(playwright) -> None:
    browser = await playwright.chromium.launch(headless=False)  # Launch the browser asynchronously
    context = await browser.new_context()  # Create a new browser context
    page = await context.new_page()  # Open a new page
    await page.goto("https://main.web-gateway.dev.nhsnotify.national.nhs.uk/templates/create-and-submit-templates")

    # Perform actions asynchronously
    await page.get_by_test_id("link-button").click()
    await page.get_by_test_id("NHS_APP-radio").check()
    await page.get_by_test_id("submit-button").click()
    await page.get_by_label("Template name").click()
    await page.get_by_label("Template name").fill("PerformanceTest")
    await page.get_by_label("Message").click()
    await page.get_by_label("Message").fill("PerformanceTest")
    await page.get_by_role("button", name="Continue").click()
    await page.get_by_test_id("nhsapp-submit-radio").check()
    await page.get_by_test_id("submit-button").click()
    await page.get_by_role("button", name="Submit template").click()

    # Cleanup
    await context.close()
    await browser.close()

# Main entry point to run the async function
async def main():
    async with async_playwright() as playwright:
        await run(playwright)

# Run the async main function
asyncio.run(main())
