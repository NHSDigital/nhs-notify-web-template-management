import { mock } from 'jest-mock-extended';
import { makeTemplateFileScannedEvent } from 'nhs-notify-web-template-management-test-helper-utils';
import { LetterUploadRepository } from '../../../templates/infra';
import { createHandler } from '../../../templates/api/delete-failed-scanned-object';

function setup() {
  const mocks = { letterUploadRepository: mock<LetterUploadRepository>() };
  const handler = createHandler(mocks);
  return { handler, mocks };
}

it('deletes the file with scan status FAILED', async () => {
  const { handler, mocks } = setup();

  const event = makeTemplateFileScannedEvent({
    detail: {
      fileType: 'pdf-template',
      template: { id: 'template-id', owner: 'template-owner' },
      virusScanStatus: 'FAILED',
      versionId: 'template-file-version',
    },
  });

  await handler(event);

  expect(
    mocks.letterUploadRepository.deleteFromQuarantine
  ).toHaveBeenCalledWith(
    { owner: 'template-owner', id: 'template-id' },
    'pdf-template',
    'template-file-version'
  );
});

it('errors if the event has no file-type', async () => {
  const { handler, mocks } = setup();

  await expect(
    handler({
      detail: {
        template: { id: 'template-id', owner: 'template-owner' },
        virusScanStatus: 'FAILED',
        versionId: 'template-file-version',
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.letterUploadRepository.deleteFromQuarantine
  ).not.toHaveBeenCalled();
});

it('errors if the event has no template id', async () => {
  const { handler, mocks } = setup();

  await expect(
    handler({
      detail: {
        fileType: 'pdf-template',
        template: { owner: 'template-owner' },
        virusScanStatus: 'FAILED',
        versionId: 'template-file-version',
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.letterUploadRepository.deleteFromQuarantine
  ).not.toHaveBeenCalled();
});

it('errors if the event has no template owner', async () => {
  const { handler, mocks } = setup();

  await expect(
    handler({
      detail: {
        fileType: 'pdf-template',
        template: { id: 'template-id' },
        virusScanStatus: 'FAILED',
        versionId: 'template-file-version',
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.letterUploadRepository.deleteFromQuarantine
  ).not.toHaveBeenCalled();
});

it('errors if the event has no virus scan status', async () => {
  const { handler, mocks } = setup();

  await expect(
    handler({
      detail: {
        fileType: 'pdf-template',
        template: { id: 'template-id', owner: 'template-owner' },
        versionId: 'template-file-version',
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.letterUploadRepository.deleteFromQuarantine
  ).not.toHaveBeenCalled();
});

it('errors if the event has virus scan status PASSED', async () => {
  const { handler, mocks } = setup();

  await expect(
    handler({
      detail: {
        fileType: 'pdf-template',
        template: { id: 'template-id', owner: 'template-owner' },
        virusScanStatus: 'PASSED',
        versionId: 'template-file-version',
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.letterUploadRepository.deleteFromQuarantine
  ).not.toHaveBeenCalled();
});

it('errors if the event has no version id', async () => {
  const { handler, mocks } = setup();

  await expect(
    handler({
      detail: {
        fileType: 'pdf-template',
        template: { id: 'template-id', owner: 'template-owner' },
        virusScanStatus: 'FAILED',
      },
    })
  ).rejects.toThrowErrorMatchingSnapshot();

  expect(
    mocks.letterUploadRepository.deleteFromQuarantine
  ).not.toHaveBeenCalled();
});
