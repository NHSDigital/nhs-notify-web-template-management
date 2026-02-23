import type {
  InitialRenderRequest,
  RenderRequest,
} from 'nhs-notify-backend-client/src/types/render-request';
import type {
  SourceRepository,
  SourceHandle,
} from '../infra/source-repository';
import type { Carbone } from '../infra/carbone';
import type { RenderRepository } from '../infra/render-repository';
import type { TemplateRepository } from '../infra/template-repository';
import type { CheckRender } from '../infra/check-render';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { analyseMarkers } from '../domain/personalisation';

export type Outcome = 'rendered' | 'rendered-invalid' | 'not-rendered';

export class App {
  constructor(
    private readonly sourceRepo: SourceRepository,
    private readonly carbone: Carbone,
    private readonly checkRender: CheckRender,
    private readonly renderRepository: RenderRepository,
    private readonly templateRepository: TemplateRepository,
    private readonly logger: Logger
  ) {}

  renderInitial(request: InitialRenderRequest): Promise<Outcome> {
    return this.renderFromSource(request, async (sourcePath, logger) => {
      const markers = await this.carbone.extractMarkers(sourcePath);
      const analysis = analyseMarkers(markers);

      const {
        personalisation,
        passthroughPersonalisation,
        validationErrors,
        canRender,
      } = analysis;

      if (!canRender) {
        logger.info('Source contains non-renderable markers', analysis);

        await this.templateRepository.updateFailure(
          request,
          personalisation,
          validationErrors
        );

        return 'not-rendered';
      }

      try {
        const { fileName, pageCount } = await this.renderAndSave(
          request,
          sourcePath,
          passthroughPersonalisation
        );

        logger.info('Saved PDF', {
          fileName,
        });

        if (validationErrors.length > 0) {
          logger.info('Source contains validation errors', analysis);

          await this.templateRepository.updateRendered(
            request,
            personalisation,
            request.currentVersion,
            fileName,
            pageCount,
            validationErrors
          );
          return 'rendered-invalid';
        }

        await this.templateRepository.updateRendered(
          request,
          personalisation,
          request.currentVersion,
          fileName,
          pageCount
        );

        logger.info('Valid initial render created');
        return 'rendered';
      } catch (error) {
        logger.error('Render failed', { error });

        await this.templateRepository.updateFailure(request, personalisation);
        return 'not-rendered';
      }
    });
  }

  private async renderFromSource(
    request: RenderRequest,
    handleRequest: (sourcePath: string, logger: Logger) => Promise<Outcome>
  ): Promise<Outcome> {
    const requestLogger = this.logger.child(request);

    requestLogger.info('Rendering');

    let source: SourceHandle | undefined;

    try {
      source = await this.sourceRepo.getSource(request);

      return await handleRequest(source.path, requestLogger);
    } catch (error) {
      requestLogger.error('Render failed', error);

      await this.templateRepository.updateFailure(request);

      return 'not-rendered';
    } finally {
      source?.dispose();
    }
  }

  private async renderAndSave(
    request: RenderRequest,
    sourcePath: string,
    personalisation: Record<string, string>
  ) {
    const pdf = await this.carbone.render(sourcePath, personalisation);

    const pageCount = await this.checkRender.pageCount(pdf);

    const fileName = await this.renderRepository.save(pdf, request, pageCount);

    return { fileName, pageCount };
  }
}
