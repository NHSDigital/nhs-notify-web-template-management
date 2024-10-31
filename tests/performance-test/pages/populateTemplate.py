class PopulateTemplate:
    def __init__(self,page):
        self.page = page
        page.set_default_timeout(10000)  # timeout in ms (10 seconds)

    async def populate_template(self):
        await self.page.get_by_label("Template name").click()  #populate template details
        await self.page.get_by_label("Template name").fill("PerformanceTest")
        await self.page.get_by_label("Message").click()
        await self.page.get_by_label("Message").fill("PerformanceTest")
        await self.page.get_by_role("button", name="Continue").click()

    async def populate_email_template(self):
        await self.page.get_by_test_id("emailTemplateName-input").click()  #populate template details
        await self.page.get_by_test_id("emailTemplateName-input").fill("Performance Test")
        await self.page.get_by_test_id("emailTemplateSubjectLine-input").click()
        await self.page.get_by_test_id("emailTemplateSubjectLine-input").fill("Performance Test")
        await self.page.get_by_test_id("emailTemplateMessage-input").click()
        await self.page.get_by_test_id("emailTemplateMessage-input").fill("Performance Test")
        await self.page.get_by_role("button", name="Continue").click()
