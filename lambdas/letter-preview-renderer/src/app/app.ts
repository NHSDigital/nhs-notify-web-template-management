import type { InitialRenderRequest } from 'nhs-notify-backend-client/src/types/render-request';
import type { SourceRepository } from '../infra/source-repository';
import type { Carbone } from '../infra/carbone';
import type { RenderRepository } from '../infra/render-repository';
import type { TemplateRepository } from '../infra/template-repository';
import type { CheckRender } from '../infra/check-render';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import type { TemplateRenderIds } from 'nhs-notify-backend-client/src/types/render-request';
import { getPersonalisation } from '../domain/personalisation';
import { NonRenderableMarkersError, RenderFailureError } from '../types/errors';
import { Personalisation, RenderVariant } from '../types/types';

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

    const source = await this.sourceRepo.getSource(template).catch((error) => {
      templateLogger.error('Failed to get docx source', error);
      throw error;
    });

    const markers = await this.carbone.extractMarkers(source.path);
    const classifiedPersonalisation = getPersonalisation(markers);

    const {
      personalisation,
      passthroughPersonalisation,
      invalidRenderablePersonalisation,
      nonRenderablePersonalisation,
    } = classifiedPersonalisation;

    if (nonRenderablePersonalisation.length > 0) {
      templateLogger
        .child({ personalisation: classifiedPersonalisation })
        .info('Source contains non-renderable personalisation');

      throw new NonRenderableMarkersError(nonRenderablePersonalisation);
    }
    try {
      const renderDetails = await this.renderAndSave(
        source.path,
        template,
        'initial',
        passthroughPersonalisation
      );

      const hasInvalidMarkers = invalidRenderablePersonalisation.length > 0;
      const status = hasInvalidMarkers ? 'FAILED' : 'RENDERED';

      await this.templateRepo.update(template, 'initial', personalisation, {
        status,
        ...renderDetails,
      });

      return hasInvalidMarkers ? 'rendered-invalid' : 'rendered';
    } catch (error) {
      if (
        error instanceof RenderFailureError ||
        error instanceof NonRenderableMarkersError
      ) {
        templateLogger.info('Render failed', { error });

        await this.templateRepo.updateFailed(
          template,
          'initial',
          personalisation
        );

        return 'not-rendered';
      }

      throw error;
    } finally {
      source.dispose();
    }
  }

  private async renderAndSave(
    sourcePath: string,
    template: TemplateRenderIds,
    variant: RenderVariant,
    passthroughPersonalisation: Record<string, string>
  ) {
    const pdf = await this.carbone.render(
      sourcePath,
      passthroughPersonalisation
    );

    const pageCount = await this.checkRender.pageCount(pdf);

    const saveResult = await this.renderRepo.save(
      pdf,
      template,
      variant,
      pageCount
    );

    return { ...saveResult, pageCount };
  }
}
