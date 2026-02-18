import { App } from '../../app/app';
import type { Carbone } from '../../infra/carbone';
import type { CheckRender } from '../../infra/check-render';
import type {
  RenderRepository,
  SaveResult,
} from '../../infra/render-repository';
import type {
  SourceHandle,
  SourceRepository,
} from '../../infra/source-repository';
import { mock } from 'jest-mock-extended';
import type { TemplateRepository } from '../../infra/template-repository';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';
import type { InitialRenderRequest } from 'nhs-notify-backend-client/src/types/render-request';

const validMarkers = new Set([
  'd.address_line_1',
  'd.address_line_2',
  'd.address_line_3',
  'd.address_line_4',
  'd.address_line_5',
  'd.address_line_6',
  'd.address_line_7',
  'd.first_name',
]);

// eslint-disable-next-line sonarjs/publicly-writable-directories
const createSourceHandle = (path = '/tmp/source.docx'): SourceHandle => ({
  path,
  dispose: jest.fn(),
});

const createRequest = (
  overrides: Partial<InitialRenderRequest['template']> = {}
): InitialRenderRequest => ({
  requestType: 'initial',
  template: {
    clientId: 'test-client',
    templateId: 'test-template',
    ...overrides,
  },
});

function setup() {
  const sourceRepo = mock<SourceRepository>();

  const carbone = mock<Carbone>();

  const checkRender = mock<CheckRender>();

  const renderRepo = mock<RenderRepository>();

  const templateRepo = mock<TemplateRepository>();

  const { logger, logMessages } = createMockLogger();

  const app = new App(
    sourceRepo,
    carbone,
    checkRender,
    renderRepo,
    templateRepo,
    logger
  );

  return {
    app,
    mocks: { sourceRepo, carbone, checkRender, renderRepo, templateRepo },
    logMessages,
  };
}

describe('App', () => {
  describe('renderInitial', () => {
    describe('happy path', () => {
      test('renders template with valid markers and returns "rendered"', async () => {
        const { app, mocks } = setup();

        const request = createRequest();
        const sourceHandle = createSourceHandle();
        const pdfBuffer = Buffer.from('pdf content');
        const pageCount = 2;
        const saveResult: SaveResult = {
          fileName: 'test-client/test-template/renders/initial/abc123.pdf',
          currentVersion: 'version-123',
        };

        mocks.sourceRepo.getSource.mockResolvedValue(sourceHandle);
        mocks.carbone.extractMarkers.mockResolvedValue(validMarkers);
        mocks.carbone.render.mockResolvedValue(pdfBuffer);
        mocks.checkRender.pageCount.mockResolvedValue(pageCount);
        mocks.renderRepo.save.mockResolvedValue(saveResult);
        mocks.templateRepo.update.mockResolvedValue();

        const outcome = await app.renderInitial(request);

        expect(outcome).toBe('rendered');

        expect(mocks.sourceRepo.getSource).toHaveBeenCalledWith(
          request.template
        );
        expect(mocks.carbone.extractMarkers).toHaveBeenCalledWith(
          sourceHandle.path
        );
        expect(mocks.carbone.render).toHaveBeenCalledWith(
          sourceHandle.path,
          expect.objectContaining({
            address_line_1: expect.any(String),
            first_name: expect.any(String),
          })
        );
        expect(mocks.checkRender.pageCount).toHaveBeenCalledWith(pdfBuffer);
        expect(mocks.renderRepo.save).toHaveBeenCalledWith(
          pdfBuffer,
          request.template,
          'initial',
          pageCount
        );

        expect(mocks.templateRepo.update).toHaveBeenCalledWith(
          request.template,
          'initial',
          {
            system: [
              'address_line_1',
              'address_line_2',
              'address_line_3',
              'address_line_4',
              'address_line_5',
              'address_line_6',
              'address_line_7',
            ],
            custom: ['first_name'],
          },
          {
            status: 'RENDERED',
            ...saveResult,
            pageCount,
          }
        );
      });
    });

    describe('invalid-renderable markers', () => {
      test('renders template but returns "rendered-invalid" when markers have invalid paths', async () => {
        const { app, mocks } = setup();

        const request = createRequest();
        const sourceHandle = createSourceHandle();
        const pdfBuffer = Buffer.from('pdf content');
        const pageCount = 1;
        const saveResult: SaveResult = {
          fileName: 'test-client/test-template/renders/initial/abc123.pdf',
          currentVersion: 'version-456',
        };

        const markersWithInvalidPath = new Set([...validMarkers, 'foo.bar']);

        mocks.sourceRepo.getSource.mockResolvedValue(sourceHandle);
        mocks.carbone.extractMarkers.mockResolvedValue(markersWithInvalidPath);
        mocks.carbone.render.mockResolvedValue(pdfBuffer);
        mocks.checkRender.pageCount.mockResolvedValue(pageCount);
        mocks.renderRepo.save.mockResolvedValue(saveResult);
        mocks.templateRepo.update.mockResolvedValue();

        const outcome = await app.renderInitial(request);

        expect(outcome).toBe('rendered-invalid');

        expect(mocks.templateRepo.update).toHaveBeenCalledWith(
          request.template,
          'initial',
          {
            system: [
              'address_line_1',
              'address_line_2',
              'address_line_3',
              'address_line_4',
              'address_line_5',
              'address_line_6',
              'address_line_7',
            ],
            custom: ['first_name'],
          },
          {
            status: 'FAILED',
            ...saveResult,
            pageCount,
          }
        );
      });
    });

    describe('non-renderable markers', () => {
      test('returns "not-rendered" when template has non-renderable markers', async () => {
        const { app, mocks } = setup();
        const request = createRequest();
        const sourceHandle = createSourceHandle();

        const nonRenderableMarkers = new Set([...validMarkers, 'c.compliment']);

        mocks.sourceRepo.getSource.mockResolvedValue(sourceHandle);
        mocks.carbone.extractMarkers.mockResolvedValue(nonRenderableMarkers);
        mocks.templateRepo.updateFailed.mockResolvedValue();

        const outcome = await app.renderInitial(request);

        expect(outcome).toBe('not-rendered');

        expect(mocks.carbone.render).not.toHaveBeenCalled();
        expect(mocks.checkRender.pageCount).not.toHaveBeenCalled();
        expect(mocks.renderRepo.save).not.toHaveBeenCalled();

        expect(mocks.templateRepo.updateFailed).toHaveBeenCalledWith(
          request.template,
          'initial',
          {
            system: [
              'address_line_1',
              'address_line_2',
              'address_line_3',
              'address_line_4',
              'address_line_5',
              'address_line_6',
              'address_line_7',
            ],
            custom: ['first_name'],
          }
        );
      });
    });

    describe('infrastructure failures', () => {
      test('returns "not-rendered" when source fetch fails', async () => {
        const { app, mocks } = setup();

        const request = createRequest();

        mocks.sourceRepo.getSource.mockRejectedValue(new Error('S3 error'));
        mocks.templateRepo.updateFailed.mockResolvedValue();

        const outcome = await app.renderInitial(request);

        expect(outcome).toBe('not-rendered');
        expect(mocks.templateRepo.updateFailed).toHaveBeenCalledWith(
          request.template,
          'initial'
        );
      });

      test('returns "not-rendered" when marker extraction fails', async () => {
        const { app, mocks } = setup();

        const request = createRequest();
        const sourceHandle = createSourceHandle();

        mocks.sourceRepo.getSource.mockResolvedValue(sourceHandle);

        mocks.carbone.extractMarkers.mockRejectedValue(
          new Error('Carbone error')
        );
        mocks.templateRepo.updateFailed.mockResolvedValue();

        const outcome = await app.renderInitial(request);

        expect(outcome).toBe('not-rendered');
        expect(mocks.templateRepo.updateFailed).toHaveBeenCalledWith(
          request.template,
          'initial'
        );
      });

      test('returns "not-rendered" when render fails', async () => {
        const { app, mocks } = setup();

        const request = createRequest();
        const sourceHandle = createSourceHandle();

        mocks.sourceRepo.getSource.mockResolvedValue(sourceHandle);
        mocks.carbone.extractMarkers.mockResolvedValue(validMarkers);
        mocks.carbone.render.mockRejectedValue(
          new Error('Carbone render error')
        );
        mocks.templateRepo.updateFailed.mockResolvedValue();

        const outcome = await app.renderInitial(request);

        expect(outcome).toBe('not-rendered');
        expect(mocks.templateRepo.updateFailed).toHaveBeenCalledWith(
          request.template,
          'initial',
          {
            system: [
              'address_line_1',
              'address_line_2',
              'address_line_3',
              'address_line_4',
              'address_line_5',
              'address_line_6',
              'address_line_7',
            ],
            custom: ['first_name'],
          }
        );
      });

      test('returns "not-rendered" when page count fails', async () => {
        const { app, mocks } = setup();

        const request = createRequest();
        const sourceHandle = createSourceHandle();
        const pdfBuffer = Buffer.from('pdf content');

        mocks.sourceRepo.getSource.mockResolvedValue(sourceHandle);
        mocks.carbone.extractMarkers.mockResolvedValue(validMarkers);
        mocks.carbone.render.mockResolvedValue(pdfBuffer);
        mocks.checkRender.pageCount.mockRejectedValue(
          new Error('pdf-lib error')
        );
        mocks.templateRepo.updateFailed.mockResolvedValue();

        const outcome = await app.renderInitial(request);

        expect(outcome).toBe('not-rendered');

        expect(mocks.templateRepo.updateFailed).toHaveBeenCalledWith(
          request.template,
          'initial',
          {
            system: [
              'address_line_1',
              'address_line_2',
              'address_line_3',
              'address_line_4',
              'address_line_5',
              'address_line_6',
              'address_line_7',
            ],
            custom: ['first_name'],
          }
        );
      });

      test('returns "not-rendered" when save fails', async () => {
        const { app, mocks } = setup();

        const request = createRequest();
        const sourceHandle = createSourceHandle();
        const pdfBuffer = Buffer.from('pdf content');
        const pageCount = 2;

        mocks.sourceRepo.getSource.mockResolvedValue(sourceHandle);
        mocks.carbone.extractMarkers.mockResolvedValue(validMarkers);
        mocks.carbone.render.mockResolvedValue(pdfBuffer);
        mocks.checkRender.pageCount.mockResolvedValue(pageCount);
        mocks.renderRepo.save.mockRejectedValue(new Error('S3 upload error'));
        mocks.templateRepo.updateFailed.mockResolvedValue();

        const outcome = await app.renderInitial(request);

        expect(outcome).toBe('not-rendered');

        expect(mocks.templateRepo.updateFailed).toHaveBeenCalledWith(
          request.template,
          'initial',
          {
            system: [
              'address_line_1',
              'address_line_2',
              'address_line_3',
              'address_line_4',
              'address_line_5',
              'address_line_6',
              'address_line_7',
            ],
            custom: ['first_name'],
          }
        );
      });
    });
  });
});
