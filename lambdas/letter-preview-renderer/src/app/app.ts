import type {
  InitialRenderRequest,
  TemplateRenderIds,
} from 'nhs-notify-backend-client/src/types/render-request';
import type { SourceRepository } from '../infra/source-repository';
import type { Carbone } from '../infra/carbone';
import type { RenderRepository } from '../infra/render-repository';
import type { TemplateRepository } from '../infra/template-repository';
import type { CheckRender } from '../infra/check-render';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { getPersonalisation } from '../domain/personalisation';
import type { RenderVariant } from '../types/types';
import { failure, Result, success } from '../types/result';

// should an intial request have a locknumber?

type Outcome = 'rendered' | 'rendered-invalid' | 'not-rendered';

export class App {
  constructor(
    private readonly sourceRepo: SourceRepository,
    private readonly carbone: Carbone,
    private readonly checkRender: CheckRender,
    private readonly renderRepo: RenderRepository,
    private readonly templateRepo: TemplateRepository,
    private readonly logger: Logger
  ) {}

  async renderInitial({
    template,
  }: InitialRenderRequest): Promise<Result<Outcome>> {
    const templateLogger = this.logger.child({
      ...template,
      renderVariant: 'initial',
    });

    await using sourceDisposable = await this.sourceRepo.getSource(template);

    if (!sourceDisposable.result.ok) {
      templateLogger.error(
        'Failed to fetch source file',
        sourceDisposable.result.error
      );

      return await this.handleNonRenderable(
        template,
        'initial',
        templateLogger
      );
    }

    const { data: source } = sourceDisposable.result;

    const markersResult = await this.carbone.extractMarkers(source);

    if (!markersResult.ok) {
      templateLogger.info(
        'Failed to extract markers from source',
        markersResult.error
      );

      return await this.handleNonRenderable(
        template,
        'initial',
        templateLogger
      );
    }

    const markers = markersResult.data;

    const personalisation = getPersonalisation(markers);

    const {
      passthroughPersonalisation,
      invalidRenderablePersonalisation,
      nonRenderablePersonalisation,
    } = personalisation;

    if (nonRenderablePersonalisation.length > 0) {
      this.logger
        .child(personalisation)
        .info('Source contains non-renderable personalisation');

      return await this.handleNonRenderable(
        template,
        'initial',
        templateLogger
      );
    }

    const renderResult = await this.carbone.render(
      source,
      passthroughPersonalisation
    );

    if (!renderResult.ok) {
      this.logger.error('Failed to render', renderResult.error);

      return await this.handleNonRenderable(
        template,
        'initial',
        templateLogger
      );
    }

    const buf = renderResult.data;

    const pagesResult = await this.checkRender.pageCount(buf);

    if (!pagesResult.ok) {
      this.logger.error('Failed to count pages', pagesResult.error);

      return await this.handleNonRenderable(
        template,
        'initial',
        templateLogger
      );
    }

    const { data: pages } = pagesResult;

    const savePdfResult = await this.renderRepo.save(
      buf,
      template,
      'initial',
      pages
    );

    if (!savePdfResult.ok) {
      this.logger.error('failed to save PDF', savePdfResult.error);

      return await this.handleNonRenderable(
        template,
        'initial',
        templateLogger
      );
    }

    const { data: filename } = savePdfResult;

    if (invalidRenderablePersonalisation.length > 0) {
      return await this.handleRenderedInvalid(
        template,
        pages,
        filename,
        templateLogger
      );
    }

    return await this.handleRenderedValid(
      template,
      'initial',
      pages,
      filename,
      templateLogger
    );
  }

  private async handleRenderedValid(
    template: TemplateRenderIds,
    renderVariant: RenderVariant,
    pages: number,
    filename: string,
    logger: Logger
  ): Promise<Result<Outcome>> {
    const updateResult = await this.templateRepo.update(
      template,
      renderVariant,
      'RENDERED',
      'NOT_YET_SUBMITTED',
      pages,
      filename
    );

    if (!updateResult.ok) {
      return this.handleUpdateFailure(updateResult.error, logger);
    }

    return success('rendered');
  }

  private async handleNonRenderable(
    template: TemplateRenderIds,
    renderVariant: RenderVariant,
    logger: Logger
  ): Promise<Result<Outcome>> {
    // add specific error details?
    const updateResult = await this.templateRepo.update(
      template,
      renderVariant,
      'FAILED',
      'VALIDATION_FAILED'
    );

    if (!updateResult.ok) {
      return this.handleUpdateFailure(updateResult.error, logger);
    }

    return success('not-rendered');
  }

  private async handleRenderedInvalid(
    template: TemplateRenderIds,
    pages: number,
    filename: string,
    logger: Logger
  ): Promise<Result<Outcome>> {
    // add specific error details?
    const updateResult = await this.templateRepo.update(
      template,
      'initial',
      'FAILED',
      'VALIDATION_FAILED',
      pages,
      filename
    );

    if (!updateResult.ok) {
      return this.handleUpdateFailure(updateResult.error, logger);
    }

    return success('not-rendered');
  }

  private handleUpdateFailure(error: unknown, logger: Logger) {
    logger.error('Failed to update database', error);

    return failure('failed-update');
  }
}
