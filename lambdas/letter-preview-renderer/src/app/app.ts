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
import type { Result } from '../types/result';

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
  }: InitialRenderRequest): Promise<Result<null>> {
    const _templateLogger = this.logger.child(template);

    await using source = await this.sourceRepo.getSource(template);

    const markersResult = await this.carbone.extractMarkers(source.path);

    if (!markersResult.ok) {
      return this.recordNonRenderable(template);
    }

    const markers = markersResult.data;

    const personalisation = getPersonalisation(markers);

    if (personalisation.nonRenderablePersonalisation.length > 0) {
      return this.recordNonRenderable(template);
    }

    const renderResult = await this.carbone.render(
      source.path,
      personalisation.passthroughPersonalisation
    );

    if (!renderResult.ok) {
      return this.recordNonRenderable(template);
    }

    const buf = renderResult.data;

    const pages = await this.checkRender.pageCount(buf);

    const filename = await this.renderRepo.save(buf, template, pages);

    if (personalisation.invalidRenderablePersonalisation.length > 0) {
      return this.recordRenderedInvalid(template, pages, filename);
    }

    return this.recordRenderedValid(template, pages, filename);
  }

  private recordRenderedValid(
    template: TemplateRenderIds,
    pages: number,
    filename: string
  ): Promise<Result<null>> {
    return this.templateRepo.update(
      template,
      'NOT_YET_SUBMITTED',
      pages,
      filename
    );
  }

  private recordNonRenderable(
    template: TemplateRenderIds
  ): Promise<Result<null>> {
    // add specific error details?
    return this.templateRepo.update(template, 'VALIDATION_FAILED');
  }

  private recordRenderedInvalid(
    template: TemplateRenderIds,
    pages: number,
    filename: string
  ): Promise<Result<null>> {
    // add specific error details?
    return this.templateRepo.update(
      template,
      'VALIDATION_FAILED',
      pages,
      filename
    );
  }
}
