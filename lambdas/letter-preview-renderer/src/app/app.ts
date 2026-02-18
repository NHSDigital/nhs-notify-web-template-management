import type { InitialRenderRequest } from 'nhs-notify-backend-client/src/types/render-request';
import type {
  SourceRepository,
  SourceHandle,
} from '../infra/source-repository';
import type { Carbone } from '../infra/carbone';
import type { RenderRepository } from '../infra/render-repository';
import type { TemplateRepository } from '../infra/template-repository';
import type { CheckRender } from '../infra/check-render';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import type { TemplateRenderIds } from 'nhs-notify-backend-client/src/types/render-request';
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

  async renderInitial({ template }: InitialRenderRequest): Promise<Outcome> {
    const templateLogger = this.logger.child({
      ...template,
      renderVariant: 'initial',
    });

    let source: SourceHandle | undefined;

    try {
      source = await this.sourceRepo.getSource(template);
      return await this.processTemplate(source.path, template, templateLogger);
    } catch (error) {
      templateLogger.error('Render failed', { error });
      await this.templateRepo.updateFailed(template, 'initial');
      return 'not-rendered';
    } finally {
      source?.dispose();
    }
  }

  private async processTemplate(
    sourcePath: string,
    template: TemplateRenderIds,
    templateLogger: Logger
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
      templateLogger
        .child({ personalisation: classifiedPersonalisation })
        .info('Source contains non-renderable personalisation');

      await this.templateRepo.updateFailed(
        template,
        'initial',
        personalisation
      );
      return 'not-rendered';
    }

    try {
      const pdf = await this.carbone.render(
        sourcePath,
        passthroughPersonalisation
      );
      const pageCount = await this.checkRender.pageCount(pdf);
      const saveResult = await this.renderRepo.save(
        pdf,
        template,
        'initial',
        pageCount
      );

      const hasInvalidMarkers = invalidRenderablePersonalisation.length > 0;
      const status = hasInvalidMarkers ? 'FAILED' : 'RENDERED';

      await this.templateRepo.update(template, 'initial', personalisation, {
        status,
        ...saveResult,
        pageCount,
      });

      return hasInvalidMarkers ? 'rendered-invalid' : 'rendered';
    } catch (error) {
      templateLogger.error('Render failed', { error });
      await this.templateRepo.updateFailed(
        template,
        'initial',
        personalisation
      );
      return 'not-rendered';
    }
  }
}
