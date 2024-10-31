class ChooseTemplate:
    def __init__(self,page):
        self.page = page
        page.set_default_timeout(10000)  # timeout in ms (10 seconds)

    async def choose_template_type(self, template_radio_btn):
        await self.page.get_by_test_id(template_radio_btn).check()  #select template
        await self.page.get_by_test_id("submit-button").click()
