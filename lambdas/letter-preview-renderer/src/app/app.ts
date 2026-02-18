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
import { getPersonalisation } from '../domain/personalisation';

export type Outcome = 'rendered' | 'rendered-invalid' | 'not-rendered';

export class App {
  constructor(
    private readonly sourceRepo: SourceRepository,
    private readonly carbone: Carbone,
    private readonly checkRender: CheckRender,
    private readonly renderRepo: RenderRepository,
    private readonly templateRepo: TemplateRepository,
    private readonly logger: Logger
  ) {}

  async renderInitial(request: InitialRenderRequest): Promise<Outcome> {
    return this.render(request, (sourcePath, logger) =>
      this.processInitialRender(sourcePath, request, logger)
    );
  }

  private async render(
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
      requestLogger.error('Render failed', { error });

      await this.templateRepo.updateFailure(request);

      return 'not-rendered';
    } finally {
      source?.dispose();
    }
  }

  private async processInitialRender(
    sourcePath: string,
    request: InitialRenderRequest,
    logger: Logger
  ): Promise<Outcome> {
    const markers = await this.carbone.extractMarkers(sourcePath);
    const classifiedPersonalisation = getPersonalisation(markers);

    const {
      personalisation,
      passthroughPersonalisation,
      invalidRenderablePersonalisation,
      nonRenderablePersonalisation,
    } = classifiedPersonalisation;

    if (nonRenderablePersonalisation.length > 0) {
      logger.info(
        'Source contains non-renderable personalisation',
        classifiedPersonalisation
      );

      await this.templateRepo.updateFailure(request, personalisation);
      return 'not-rendered';
    }

    try {
      const pdf = await this.carbone.render(
        sourcePath,
        passthroughPersonalisation
      );

      const pageCount = await this.checkRender.pageCount(pdf);

      const fileName = await this.renderRepo.save(pdf, request, pageCount);

      logger.info('Saved PDF', {
        fileName,
      });

      if (invalidRenderablePersonalisation.length > 0) {
        logger.info(
          'Source contains invalid markers',
          classifiedPersonalisation
        );

        await this.templateRepo.updateFailure(request, personalisation);
        return 'rendered-invalid';
      }

      await this.templateRepo.updateSuccess(
        request,
        personalisation,
        request.currentVersion,
        fileName,
        pageCount
      );

      logger.info('Valid initial render was created');

      return 'rendered';
    } catch (error) {
      logger.error('Render failed', { error });

      await this.templateRepo.updateFailure(request, personalisation);
      return 'not-rendered';
    }
  }
}
