import logging
import nest_asyncio
from locust import task, between
from locust_plugins.users.playwright import pw, PlaywrightUser, PageWithRetry
from helpers.functions import run_async, log_and_handle_error
from pages.createTemplate import CreateTemplate
from pages.chooseTemplate import ChooseTemplate
from pages.populateTemplate import PopulateTemplate
from pages.previewTemplate import PreviewTemplate
from pages.submitTemplate import SubmitTemplate
from pages.templateConfirmation import TemplateConfirmation

# Configure logging to capture Playwright errors
logging.basicConfig(level=logging.ERROR)
playwright_logger = logging.getLogger(__name__)

nest_asyncio.apply()  # this is needed and should not be removed

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
            await run_async(log_and_handle_error(self,"1_Load Homepage", create_template.load_homepage()))
            await run_async(log_and_handle_error(self,"2_Click Start Now", create_template.click_start_now()))
            await run_async(log_and_handle_error(self,"3_Select SMS And Continue", choose_template.choose_template_type("SMS-radio")))
            await run_async(log_and_handle_error(self,"4_Populate SMS Template", populate_template.populate_template()))
            await run_async(log_and_handle_error(self,"5_Preview SMS Template", preview_template.preview_template("sms-submit-radio")))
            await run_async(log_and_handle_error(self,"6_Submit SMS Template", submit_template.submit_template()))
            await run_async(log_and_handle_error(self,"7_Confirm SMS Template", template_confirmation.confirm_template()))
        except Exception as e:
            playwright_logger.error(f"Playwright encountered a critical error: {e}")
            raise  # Reraising to allow Locust to capture it as a task failure
