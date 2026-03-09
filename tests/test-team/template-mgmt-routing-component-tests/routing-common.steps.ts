import { test, expect } from '@playwright/test';
import { RoutingChooseTemplateForMessagePlanBasePage } from '../pages/routing/choose-template-base-page';

type ChooseTemplatePageProps = {
  page: RoutingChooseTemplateForMessagePlanBasePage;
};

export function assertChooseTemplatePageWithTemplatesAvailable({
  page,
}: ChooseTemplatePageProps) {
  return test.step('choose template page displays templates', async () => {
    await expect(page.messagePlanName).toBeVisible();

    await expect(page.templatesTable).toBeVisible();

    await expect(page.tableHintText).toBeVisible();

    await expect(page.saveAndContinueButton).toBeVisible();
    await expect(page.saveAndContinueButton).toHaveText('Save and continue');

    await expect(page.noTemplatesMessage).toBeHidden();

    await expect(page.goToTemplatesLink).toBeHidden();

    await expect(page.previousSelectionDetails).toBeHidden();
  });
}

export function assertChooseTemplatePageWithNoTemplates({
  page,
}: ChooseTemplatePageProps) {
  return test.step('choose template page displays no templates message', async () => {
    await expect(page.messagePlanName).toBeVisible();

    await expect(page.noTemplatesMessage).toBeVisible();

    await expect(page.goToTemplatesLink).toBeVisible();
    await expect(page.goToTemplatesLink).toHaveAttribute(
      'href',
      '/templates/message-templates'
    );

    await expect(page.backLinkBottom).toBeVisible();
    await expect(page.backLinkBottom).toHaveAttribute(
      'href',
      expect.stringContaining('/templates/message-plans/edit-message-plan')
    );

    await expect(page.templatesTable).toBeHidden();

    await expect(page.saveAndContinueButton).toBeHidden();

    await expect(page.previousSelectionDetails).toBeHidden();
  });
}

export function assertChooseTemplatePageWithPreviousSelection({
  page,
}: ChooseTemplatePageProps) {
  return test.step('choose template page displays previous selection', async () => {
    await expect(page.messagePlanName).toBeVisible();

    await expect(page.tableHintText).toBeVisible();

    await expect(page.templatesTable).toBeVisible();

    await expect(page.previousSelectionDetails).toBeVisible();

    await expect(page.saveAndContinueButton).toBeVisible();
    await expect(page.saveAndContinueButton).toHaveText('Save and continue');

    await expect(page.noTemplatesMessage).toBeHidden();

    await expect(page.goToTemplatesLink).toBeHidden();
  });
}
