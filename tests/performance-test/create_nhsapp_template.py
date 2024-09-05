from locust import FastHttpUser, between, task
import logging
import re
from locust_plugins.transaction_manager import TransactionManager
from time import time
from datetime import datetime

class SubmitNHSAppTemplate(FastHttpUser):
    wait_time = between(5,10)

    def on_start(self):
        self.tm = TransactionManager()

    def get_credential(self):
        userName = self.environment.parsed_options.user_name
        password = self.environment.parsed_options.password
        return (userName,password)

    def get_headers(self):
        return {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
        }

    def template_headers(self):
        return {
            'Accept': 'text/x-component',
            'Content-type': 'text/plain;charset=UTF-8'
        }

    @task
    def landing(self):
        headers = self.get_headers()
        credentials = self.get_credential()

        self.tm.start_transaction("A_NHSAPP_01_LandingPage")

        with self.client.get("/create-and-submit-templates", name='A_01_CreateSubmitTemplate', headers=headers, auth=(credentials), catch_response=True) as resp:
            if resp.status_code == 200:
                if 'Create and submit a template to NHS Notify' in resp.text:
                    resp.success()
                    self.tasks = [self.__class__.start_now]
                else:
                    resp.failure("response does not contain header text")
                    self.tasks = [self.__class__.landing]
            else:
                print("Error in login")
                print(resp.content)
                self.tasks = [self.__class__.landing]

        self.tm.end_transaction("A_NHSAPP_01_LandingPage")

    def start_now(self):
        headers = self.get_headers()
        credentials = self.get_credential()

        self.tm.start_transaction("A_NHSAPP_02_StartNow")

        with self.client.get("/create-template", name='A_02_CreateTemplate', allow_redirects=False, headers=headers, auth=(credentials), catch_response=True) as resp:
            if resp.status_code == 307:
                resp.success()
                try:
                    session_storage = re.search(r"choose-a-template-type/(.*?);", resp.text)
                    self.session_storage = session_storage.group(1)
                except AttributeError:
                    self.session_storage = ""
            else:
                print("Error on start now - create template")
                print(resp.content)
                self.tasks = [self.__class__.landing]

        with self.client.get(f"/choose-a-template-type/{self.session_storage}", name='A_02_ChooseTemplateType', headers=headers, auth=(credentials), catch_response=True) as resp2:
            if resp2.status_code == 200:
                if 'Choose a template type to create' in resp2.text:
                    resp2.success()
                else:
                    resp2.failure("Assert failure, response does not contain header text")
                    self.tasks = [self.__class__.landing]
            else:
                print("Error on start now - choose template")
                print(resp.content)
                self.tasks = [self.__class__.landing]

        with self.client.get("/create-and-submit-templates?_rsc=aijwb", name='A_02_CreateSubmitTemplate', headers=headers, auth=(credentials), catch_response=True) as resp3:
            if resp3.status_code == 200:
                if 'create-and-submit-templates' in resp3.text:
                    resp3.success()
                    self.tasks = [self.__class__.choose_template]
                else:
                    resp3.failure("Assert failure, response does not contain header text")
                    self.tasks = [self.__class__.landing]
            else:
                print("Error on start now2")
                print(resp3.content)
                self.tasks = [self.__class__.landing]

        self.tm.end_transaction("A_NHSAPP_02_StartNow")

    def choose_template(self):
        headers = self.get_headers()
        choose_template_headers = self.template_headers()
        credentials = self.get_credential()
        timestamp_format = "%Y-%m-%dT%H:%M:%S.000Z"
        current_datetime = datetime.fromtimestamp(time()).strftime(timestamp_format)

        body = '[{"id":{self.session_storage},"templateType":"NHS_APP","nhsAppTemplateName":"","nhsAppTemplateMessage":"","createdAt":"{self.current_datetime}","updatedAt":"{self.current_datetime}","validationError":"$undefined"}]'

        self.tm.start_transaction("A_NHSAPP_03_ChooseTemplate")

        with self.client.post(f"/choose-a-template-type/{self.session_storage}", name='A_03_ChooseTemplateType', data=body, headers=choose_template_headers, auth=(credentials), catch_response=True) as resp:
            if resp.status_code == 200:
                if 'choose-a-template-type' in resp.text:
                    resp.success()
                else:
                    resp.failure("Assert failure, response does not contain header text")
                    self.tasks = [self.__class__.landing]
            else:
                print("Error on choose template")
                logging.error(resp)
                print(resp.content)
                self.tasks = [self.__class__.landing]

        with self.client.get(f"/create-nhs-app-template/{self.session_storage}?_rsc=1pr28", name='A_03_NHSappTemplate', headers=headers, auth=(credentials), catch_response=True) as resp2:
            if resp2.status_code == 200:
                if 'create-nhs-app-template' in resp2.text:
                    resp2.success()
                    self.tasks = [self.__class__.create_template]
                else:
                    resp2.failure("Assert failure, response does not contain header text")
                    self.tasks = [self.__class__.landing]
            else:
                print("Error on choose template page")
                logging.error(resp2)
                print(resp2.content)
                self.tasks = [self.__class__.landing]

        self.tm.end_transaction("A_NHSAPP_03_ChooseTemplate")

    def create_template(self):
        headers = self.get_headers()
        create_template_headers = self.template_headers()
        credentials = self.get_credential()
        timestamp_format = "%Y-%m-%dT%H:%M:%S.000Z"
        current_datetime = datetime.fromtimestamp(time()).strftime(timestamp_format)

        body = '[{"id":{self.session_storage},"templateType":"NHS_APP","nhsAppTemplateName":"PerformanceTest","nhsAppTemplateMessage":"PerformanceTest Template","createdAt":"{self.current_datetime}","updatedAt":"{self.current_datetime}","validationError":"$undefined"}]'

        self.tm.start_transaction("A_NHSAPP_04_CreateNHSAppTemplate")

        with self.client.post(f"/create-nhs-app-template/{self.session_storage}", name='A_04_CreateNHSAppTemplate', data=body, headers=create_template_headers, auth=(credentials), catch_response=True) as resp:
            if resp.status_code == 200:
                if 'create-nhs-app-template' in resp.text:
                    resp.success()
                else:
                    resp.failure("Assert failure, response does not contain header text")
                    logging.error(resp.content)
                    self.tasks = [self.__class__.landing]
            else:
                print("Error on create nhsapp template")
                logging.error(resp.content)
                print(resp.content)
                self.tasks = [self.__class__.landing]

        with self.client.get(f"/preview-nhs-app-template/{self.session_storage}?_rsc=1s4ge", name='A_04_PreviewNHSAppTemplate', headers=headers, auth=(credentials), catch_response=True) as resp2:
            if resp2.status_code == 200:
                if 'preview-nhs-app-template' in resp2.text:
                    resp2.success()
                    self.tasks = [self.__class__.submit_template]
                else:
                    resp2.failure("Assert failure, response does not contain header text")
                    logging.error(resp2.content)
                    self.tasks = [self.__class__.landing]
            else:
                print("Error on create nhsapp template")
                logging.error(resp2.content)
                print(resp2.content)
                self.tasks = [self.__class__.landing]

        self.tm.end_transaction("A_NHSAPP_04_CreateNHSAppTemplate")

    def submit_template(self):
        headers = self.get_headers()
        credentials = self.get_credential()

        self.tm.start_transaction("A_NHSAPP_05_SubmitTemplate")

        with self.client.get(f"/submit-template/{self.session_storage}", name='A_05_SubmitTemplate', headers=headers, auth=(credentials), catch_response=True) as resp:
            if resp.status_code == 200:
                if 'Placeholder Submit template' in resp.text:
                    resp.success()
                    self.tasks = [self.__class__.landing]
                else:
                    resp.failure("Assert failure, response does not contain header text")
                    logging.error(resp.content)
                    self.tasks = [self.__class__.landing]
            else:
                print("Error on submit nhsapp template")
                logging.error(resp.content)
                print(resp.content)
                self.tasks = [self.__class__.landing]

        self.tm.end_transaction("A_NHSAPP_05_SubmitTemplate")
