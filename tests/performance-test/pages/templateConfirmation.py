from playwright.async_api import expect

class TemplateConfirmation:
    def __init__(self,page):
        self.page = page
        page.set_default_timeout(10000)  # timeout in ms (10 seconds)


    async def confirm_template(self):
        await expect(self.page.get_by_role("heading", name="Template submitted")).to_be_visible()
