class PreviewTemplate:
    def __init__(self,page):
        self.page = page
        page.set_default_timeout(10000)  # timeout in ms (10 seconds)

    async def preview_template(self, template_continue_btn):
            await self.page.get_by_test_id(template_continue_btn).check()
            await self.page.get_by_test_id("submit-button").click()  #template creation confirmation
