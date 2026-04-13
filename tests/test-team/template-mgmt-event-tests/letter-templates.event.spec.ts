import {
  templateManagementEventSubscriber as test,
  expect,
} from '../fixtures/template-management-event-subscriber';
import { type TestUser, testUsers } from '../helpers/auth/cognito-auth-helper';
import { getTestContext } from '../helpers/context/context';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { eventWithId } from '../helpers/events/matchers';
import { docxFixtures } from 'fixtures/letters';

test.describe('Event publishing - Letters', () => {
  const context = getTestContext();
  const templateStorageHelper = new TemplateStorageHelper();
  let userDigitalProofingEnabled: TestUser;

  test.beforeAll(async () => {
    userDigitalProofingEnabled = await context.auth.getTestUser(
      testUsers.UserDigitalProofingEnabled.userId
    );
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('template in a PROOF_APPROVED status causes a TemplateDrafted event to be sent', async ({
    eventSubscriber,
  }) => {
    const start = new Date();

    const templateId = '0012213b-bcdd-4914-8d24-c4d446da9b4c';
    const currentVersion = '9aa5e69b-c089-48fd-a387-f24df840771b';

    const template = TemplateFactory.createAuthoringLetterTemplate(
      templateId,
      userDigitalProofingEnabled,
      'letter-event-tests-template-drafted',
      'PROOF_APPROVED',
      {
        docxTemplate: {
          currentVersion,
          fileName: 'filename.docx',
          virusScanStatus: 'PASSED',
        },
        shortFormRender: {
          status: 'RENDERED',
        },
        longFormRender: {
          status: 'RENDERED',
        },
      }
    );

    await templateStorageHelper.putScannedDocxTemplateFile(
      {
        clientId: userDigitalProofingEnabled.clientId,
        templateId,
      },
      currentVersion,
      docxFixtures.standard.open()
    );

    await templateStorageHelper.seedTemplateData([template]);

    await expect(async () => {
      const events = await eventSubscriber.receive({
        since: start,
        match: eventWithId(templateId),
      });
      expect(events.length).toBe(1);

      const draftEvents = events.filter(
        ({ record }) =>
          record.type === 'uk.nhs.notify.template-management.TemplateDrafted.v1'
      );

      expect(draftEvents.length, JSON.stringify(events)).toBe(1);
    }).toPass({ timeout: 90_000 });
  });

  test('template in a SUBMITTED status causes a TemplateCompleted event to be sent', async ({
    eventSubscriber,
  }) => {
    const start = new Date();

    const templateId = 'b5d46027-c877-4f91-9e58-96ca24cce0dd';
    const currentVersion = 'c28cea1f-ed36-47ab-b94c-b3c0695d36a1';

    const template = TemplateFactory.createAuthoringLetterTemplate(
      templateId,
      userDigitalProofingEnabled,
      'letter-event-tests-template-completed',
      'SUBMITTED',
      {
        docxTemplate: {
          currentVersion,
          fileName: 'filename.docx',
          virusScanStatus: 'PASSED',
        },
        shortFormRender: {
          status: 'RENDERED',
        },
        longFormRender: {
          status: 'RENDERED',
        },
      }
    );

    await templateStorageHelper.putScannedDocxTemplateFile(
      {
        clientId: userDigitalProofingEnabled.clientId,
        templateId,
      },
      currentVersion,
      docxFixtures.standard.open()
    );

    await templateStorageHelper.seedTemplateData([template]);

    await expect(async () => {
      const events = await eventSubscriber.receive({
        since: start,
        match: eventWithId(templateId),
      });
      expect(events.length).toBe(1);

      const completedEvents = events.filter(
        ({ record }) =>
          record.type ===
          'uk.nhs.notify.template-management.TemplateCompleted.v1'
      );

      expect(completedEvents.length, JSON.stringify(events)).toBe(1);
    }).toPass({ timeout: 90_000 });
  });

  test('template in a DELETED status causes a TemplateDeleted event to be sent when the previous status was PROOF_APPROVED', async ({
    eventSubscriber,
  }) => {
    const start = new Date();

    const templateId = 'b3e014e1-38bf-429d-a6ed-70eb92a4e4fc';
    const currentVersion = 'e3fd4109-6995-4592-9dbc-a0c467f9a51e';

    const template = TemplateFactory.createAuthoringLetterTemplate(
      templateId,
      userDigitalProofingEnabled,
      'letter-event-tests-template-deleted',
      'PROOF_APPROVED',
      {
        docxTemplate: {
          currentVersion,
          fileName: 'filename.docx',
          virusScanStatus: 'PASSED',
        },
        shortFormRender: {
          status: 'RENDERED',
        },
        longFormRender: {
          status: 'RENDERED',
        },
      }
    );

    await templateStorageHelper.putScannedDocxTemplateFile(
      {
        clientId: userDigitalProofingEnabled.clientId,
        templateId,
      },
      currentVersion,
      docxFixtures.standard.open()
    );

    await templateStorageHelper.seedTemplateData([template]);

    await templateStorageHelper.seedTemplateData([
      { ...template, templateStatus: 'DELETED' },
    ]);

    await expect(async () => {
      const events = await eventSubscriber.receive({
        since: start,
        match: eventWithId(templateId),
      });
      expect(events.length).toBe(2);

      const draftEvents = events.filter(
        ({ record }) =>
          record.type === 'uk.nhs.notify.template-management.TemplateDrafted.v1'
      );

      const completedEvents = events.filter(
        ({ record }) =>
          record.type === 'uk.nhs.notify.template-management.TemplateDrafted.v1'
      );

      expect(draftEvents.length, JSON.stringify(events)).toBe(1);
      expect(completedEvents.length, JSON.stringify(events)).toBe(1);
    }).toPass({ timeout: 90_000 });
  });

  test('template in a NOT_YET_SUBMITTED status causes no events to be sent', async ({
    eventSubscriber,
  }) => {
    const start = new Date();

    const templateId = '1be43ae1-b467-4d60-8f1e-860c5ffa8a6c';
    const currentVersion = '58cab804-1c18-4adc-bee4-9f1a9ea00b02';

    const template = TemplateFactory.createAuthoringLetterTemplate(
      templateId,
      userDigitalProofingEnabled,
      'letter-event-tests-no-events',
      'NOT_YET_SUBMITTED',
      {
        docxTemplate: {
          currentVersion,
          fileName: 'filename.docx',
          virusScanStatus: 'PASSED',
        },
      }
    );

    await templateStorageHelper.putScannedDocxTemplateFile(
      {
        clientId: userDigitalProofingEnabled.clientId,
        templateId,
      },
      currentVersion,
      docxFixtures.standard.open()
    );

    await templateStorageHelper.seedTemplateData([template]);

    await expect(async () => {
      const events = await eventSubscriber.receive({
        since: start,
        match: eventWithId(templateId),
      });
      expect(events.length).toBe(0);
    }).toPass({ timeout: 90_000 });
  });
});
