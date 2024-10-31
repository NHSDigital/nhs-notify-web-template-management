class CreateTemplate:
    def __init__(self,page):
        self.page = page
        page.set_default_timeout(10000)  # timeout in ms (10 seconds)

    async def load_homepage(self):
        await self.page.goto("https://main.web-gateway.dev.nhsnotify.national.nhs.uk/templates/create-and-submit-templates")  #Load Template Management Homepage

    async def click_start_now(self):
        await self.page.get_by_test_id("link-button").click()
