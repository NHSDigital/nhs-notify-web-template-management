import re
from playwright.sync_api import Playwright, sync_playwright, expect

def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()
    page.goto("https://main.web-gateway.dev.nhsnotify.national.nhs.uk/templates/create-and-submit-templates")
    page.get_by_test_id("link-button").click()
    page.get_by_test_id("NHS_APP-radio").check()
    page.get_by_test_id("submit-button").click()
    page.get_by_label("Template name").click()
    page.get_by_label("Template name").fill("PerformanceTest")
    page.get_by_label("Message").click()
    page.get_by_label("Message").fill("PerformanceTest")
    page.get_by_role("button", name="Continue").click()
    page.get_by_test_id("nhsapp-submit-radio").check()
    page.get_by_test_id("submit-button").click()
    page.get_by_role("button", name="Submit template").click()


    # ---------------------
    context.close()
    browser.close()



with sync_playwright() as playwright:
    run(playwright)