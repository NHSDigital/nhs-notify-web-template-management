import asyncio
import nest_asyncio
from locust import User, tag, task, between, SequentialTaskSet
from locust_plugins.users.playwright import async_playwright, pw, PlaywrightUser, event, PageWithRetry
import time


class EMAILCreate(PlaywrightUser):
    wait_time = between(1, 5)
    host = "https://main.web-gateway.dev.nhsnotify.national.nhs.uk/templates/create-and-submit-templates"  #Web Template Management Homepage
    multiplier = 5  # run XX concurrent playwright sessions/browsers for each Locust user. This helps improve load generation efficiency.

    @task
    @pw
    async def WebTemplate(self, page: PageWithRetry):
        try:
            async with event(self, "1_Load Homepage"):  # log this as first event in journey
                await page.goto("https://main.web-gateway.dev.nhsnotify.national.nhs.uk/templates/create-and-submit-templates")  #Load Template Management Homepage

            async with event(self, "2_Click Start Now"):  # log this as second event in journey
                async with page.expect_navigation(wait_until="domcontentloaded"):
                    await self.page.get_by_test_id("link-button").click()  #Start Template Creation Process
            async with event(self, "3_Select Email And Contime"):  ## log this as third event in journey
                async with page.expect_navigation(wait_until="domcontentloaded"):
                    await self.page.get_by_test_id("EMAIL-radio").check()  #select NHSApp Template
                    await self.page.get_by_test_id("submit-button").click()
            async with event(self, "4_Populate Email Template"):  ## log this as fourth event in journey
                async with page.expect_navigation(wait_until="domcontentloaded"):
                    await self.page.get_by_test_id("emailTemplateName-input").click()  #populate template details
                    await self.page.get_by_test_id("emailTemplateName-input").fill("Performance Test")
                    await self.page.get_by_test_id("emailTemplateSubjectLine-input").click()
                    await self.page.get_by_test_id("emailTemplateSubjectLine-input").fill("Performance Test")
                    await self.page.get_by_test_id("emailTemplateMessage-input").click()
                    await self.page.get_by_test_id("emailTemplateMessage-input").fill("Performance Test")
                    await self.page.get_by_role("button", name="Continue").click()
                    await self.page.get_by_test_id("email-submit-radio").check()
            async with event(self, "5_Submit Email Template"):  ## log this as fifth and final event in journey
                async with page.expect_navigation(wait_until="domcontentloaded"):
                    await self.page.get_by_test_id("submit-button").click()  #template creation confirmation
                    await self.page.get_by_role("button", name="Submit template").click()

        except:
            pass
