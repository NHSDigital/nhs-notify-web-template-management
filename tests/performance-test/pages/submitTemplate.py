class SubmitTemplate:
    def __init__(self,page):
        self.page = page
        page.set_default_timeout(10000)  # timeout in ms (10 seconds)

    async def submit_template(self):
        await self.page.get_by_role("button", name="Submit template").click()


