from locust import task, between
from locust_plugins.users.playwright import pw, PlaywrightUser, event, PageWithRetry
from pages.createTemplate import CreateTemplate
from pages.chooseTemplate import ChooseTemplate
from pages.populateTemplate import PopulateTemplate
from pages.previewTemplate import PreviewTemplate
from pages.submitTemplate import SubmitTemplate
from pages.templateConfirmation import TemplateConfirmation


class SMSCreate(PlaywrightUser):
    wait_time = between(1, 5)
    host = "https://main.web-gateway.dev.nhsnotify.national.nhs.uk/templates/create-and-submit-templates"  #Web Template Management Homepage
    multiplier = 10  # run XX concurrent playwright sessions/browsers for each Locust user. This helps improve load generation efficiency.

    @task
    @pw
    async def WebTemplate(self, page: PageWithRetry):
        create_template = CreateTemplate(page)
        choose_template = ChooseTemplate(page)
        populate_template = PopulateTemplate(page)
        preview_template = PreviewTemplate(page)
        submit_template = SubmitTemplate(page)
        template_confirmation = TemplateConfirmation(page)

        try:
            async with event(self, "1_Load Homepage"):  # log this as first event in journey
                await create_template.load_homepage()
        except Exception as e:
            print(f"An error occurred: {e}")

        try:
            async with event(self, "2_Click Start Now"):  # log this as second event in journey
                async with page.expect_navigation(wait_until="domcontentloaded"):
                    await create_template.click_start_now()
        except Exception as e:
            print(f"An error occurred: {e}")

        try:
            async with event(self, "3_Select SMS And Continue"):  # log this as third event in journey
                async with page.expect_navigation(wait_until="domcontentloaded"):
                    await choose_template.choose_template_type("SMS-radio")
        except Exception as e:
            print(f"An error occurred: {e}")

        try:
            async with event(self, "4_Populate SMS Template"):  # log this as fourth event in journey
                async with page.expect_navigation(wait_until="domcontentloaded"):
                    await populate_template.populate_template()
        except Exception as e:
            print(f"An error occurred: {e}")

        try:
            async with event(self, "5_Preview SMS Template"):  # log this as fifth event in journey
                async with page.expect_navigation(wait_until="domcontentloaded"):
                    await preview_template.preview_template("sms-submit-radio")
        except Exception as e:
            print(f"An error occurred: {e}")

        try:
            async with event(self, "6_Submit SMS Template"):  # log this as sixth event in journey
                async with page.expect_navigation(wait_until="domcontentloaded"):
                    await submit_template.submit_template()
        except Exception as e:
            print(f"An error occurred: {e}")

        try:
            async with event(self, "7_Confirm SMS Template"):  # log this as seventh and final event in journey
                async with page.expect_navigation(wait_until="domcontentloaded"):
                    await template_confirmation.confirm_template()
        except Exception as e:
            print(f"An error occurred: {e}")

        # except:
        #     pass  # TODO: replace this "do nothing" holder with something meaningful
