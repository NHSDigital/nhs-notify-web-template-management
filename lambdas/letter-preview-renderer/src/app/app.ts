import type { InitialRenderRequest } from 'nhs-notify-backend-client/src/types/render-request';
import type { SourceRepository } from '../infra/source-repository';
import type { Carbone } from '../infra/carbone';
import type { RenderRepository } from '../infra/render-repository';
import type { TemplateRepository } from '../infra/template-repository';
import type { CheckRender } from '../infra/check-render';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { getPersonalisation } from '../domain/personalisation';
import { NonRenderableMarkersError, RenderFailureError } from '../types/errors';

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

  async renderInitial({ template }: InitialRenderRequest): Promise<Outcome> {
    const templateLogger = this.logger.child({
      ...template,
      renderVariant: 'initial',
    });

    try {
      await using source = await this.sourceRepo.getSource(template);

      const markers = await this.carbone.extractMarkers(source.path);

      const personalisation = getPersonalisation(markers);

      const {
        passthroughPersonalisation,
        invalidRenderablePersonalisation,
        nonRenderablePersonalisation,
      } = personalisation;

      if (nonRenderablePersonalisation.length > 0) {
        templateLogger
          .child(personalisation)
          .info('Source contains non-renderable personalisation');

        throw new NonRenderableMarkersError(nonRenderablePersonalisation);
      }

      const pdf = await this.carbone.render(
        source.path,
        passthroughPersonalisation
      );

      const pages = await this.checkRender.pageCount(pdf);

      const filename = await this.renderRepo.save(
        pdf,
        template,
        'initial',
        pages
      );

      if (invalidRenderablePersonalisation.length > 0) {
        await this.templateRepo.update(
          template,
          'initial',
          'FAILED',
          'VALIDATION_FAILED',
          pages,
          filename
        );

        return 'rendered-invalid';
      }

      await this.templateRepo.update(
        template,
        'initial',
        'RENDERED',
        'NOT_YET_SUBMITTED',
        pages,
        filename
      );

      return 'rendered';
    } catch (error) {
      if (
        error instanceof RenderFailureError ||
        error instanceof NonRenderableMarkersError
      ) {
        templateLogger.info('Render failed', { error });

        await this.templateRepo.update(
          template,
          'initial',
          'FAILED',
          'VALIDATION_FAILED'
        );

        return 'not-rendered';
      }

      throw error;
    }
  }
}
