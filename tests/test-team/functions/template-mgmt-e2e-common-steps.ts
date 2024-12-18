import { test, expect } from '@playwright/test';
import { TemplateMgmtBasePage } from '../pages/template-mgmt-base-page';

type CommonStepsProps = {
  basePage: TemplateMgmtBasePage;
  baseURL?: string;
};

export function startPage({ basePage, baseURL }: CommonStepsProps) {
  return test.step('start page', async () => {
    await basePage.navigateTo(
      `${baseURL}/templates/create-and-submit-templates`
    );
    await expect(basePage.page).toHaveURL(
      `${baseURL}/templates/create-and-submit-templates`
    );
    await expect(basePage.pageHeader).toHaveText(
      'Create and submit a template to NHS Notify'
    );
    await basePage.clickButtonByName('Start now');
  });
}

export function chooseTemplate(
  { basePage, baseURL }: CommonStepsProps,
  channel: string
) {
  return test.step('Choose template type', async () => {
    await expect(basePage.page).toHaveURL(
      `${baseURL}/templates/choose-a-template-type`
    );

    await expect(basePage.pageHeader).toHaveText(
      'Choose a template type to create'
    );

    await basePage.checkRadio(channel);

    await basePage.clickButtonByName('Continue');
  });
}

export function createTemplate(
  { basePage, baseURL }: CommonStepsProps,
  channel: string,
  channelPath: string
) {
  return test.step('Create template', async () => {
    await expect(basePage.page).toHaveURL(
      `${baseURL}/templates/create-${channelPath}-template`
    );
    if (channel === 'Email') {
      await expect(basePage.pageHeader).toHaveText(`Create email template`);
    } else if (channel === 'Text message (SMS)') {
      await expect(basePage.pageHeader).toHaveText(
        `Create text message template`
      );
    } else {
      await expect(basePage.pageHeader).toHaveText(
        `Create ${channel} template`
      );
    }

    await basePage.fillTextBox('Template name', 'E2E Name');

    if (channel === 'Email') {
      await basePage.fillTextBox('Subject line', 'E2E subject');
    }

    await basePage.fillTextBox('Message', 'E2E Message');

    await basePage.clickButtonByName('Save and preview');
  });
}

export function previewPage(
  { basePage, baseURL }: CommonStepsProps,
  channelPath: string
) {
  return test.step('Preview page', async () => {
    await expect(basePage.page).toHaveURL(
      // eslint-disable-next-line security/detect-non-literal-regexp
      new RegExp(`${baseURL}/templates/preview-${channelPath}-template/(.*)`)
    );

    await expect(basePage.pageHeader).toHaveText('E2E Name');

    await basePage.checkRadio('Submit template');

    await basePage.clickButtonByName('Continue');
  });
}

export function submitPage(
  { basePage, baseURL }: CommonStepsProps,
  channelPath: string
) {
  return test.step('Submit page', async () => {
    await expect(basePage.page).toHaveURL(
      // eslint-disable-next-line security/detect-non-literal-regexp
      new RegExp(`${baseURL}/templates/submit-${channelPath}-template/(.*)`)
    );

    await expect(basePage.pageHeader).toHaveText(`Submit 'E2E Name'`);

    await basePage.clickButtonByName('Submit template');

    // Submitted Page
    await expect(basePage.page).toHaveURL(
      // eslint-disable-next-line security/detect-non-literal-regexp
      new RegExp(`${baseURL}/templates/${channelPath}-template-submitted/(.*)`)
    );

    await expect(basePage.pageHeader).toHaveText('Template submitted');
  });
}
