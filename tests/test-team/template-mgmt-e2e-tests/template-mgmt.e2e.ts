/* eslint-disable security/detect-non-literal-regexp */

import { test, expect } from '@playwright/test';
import { TemplateMgmtBasePage } from '../pages/template-mgmt-base-page';

for (const { channel, channelPath } of [
  { channel: 'NHS App message', channelPath: 'nhs-app' },
  { channel: 'Email', channelPath: 'email' },
  { channel: 'Text message (SMS)', channelPath: 'text-message' },
]) {
  test(`User creates and submits a new ${channel} template successfully`, async ({
    page,
    baseURL,
  }) => {
    const basePage = new TemplateMgmtBasePage(page);

    // Start Page
    await basePage.navigateTo(
      `${baseURL}/templates/create-and-submit-templates`
    );

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-and-submit-templates`
    );

    await expect(basePage.pageHeader).toHaveText(
      'Create and submit a template to NHS Notify'
    );

    await basePage.clickButtonByName('Start now');

    // Choose Template Type Page
    await expect(page).toHaveURL(`${baseURL}/templates/choose-a-template-type`);

    await expect(basePage.pageHeader).toHaveText(
      'Choose a template type to create'
    );

    await basePage.checkRadio(channel);

    await basePage.clickButtonByName('Continue');

    // Create Page
    await expect(page).toHaveURL(
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

    // Preview Page
    await expect(page).toHaveURL(
      new RegExp(`${baseURL}/templates/preview-${channelPath}-template/(.*)`)
    );

    await expect(basePage.pageHeader).toHaveText('E2E Name');

    await basePage.checkRadio('Submit template');

    await basePage.clickButtonByName('Continue');

    // Submit Page
    await expect(page).toHaveURL(
      new RegExp(`${baseURL}/templates/submit-${channelPath}-template/(.*)`)
    );

    await expect(basePage.pageHeader).toHaveText(`Submit 'E2E Name'`);

    await basePage.clickButtonByName('Submit template');

    // Submitted Page
    await expect(page).toHaveURL(
      new RegExp(`${baseURL}/templates/${channelPath}-template-submitted/(.*)`)
    );

    await expect(basePage.pageHeader).toHaveText('Template submitted');
  });
}
