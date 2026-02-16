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
import { RenderVariant } from '../types/types';

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

    await using sourceDisposable = await this.sourceRepo.getSource(template);

    if (!sourceDisposable.result.ok) {
      return this.recordNonRenderable(template, 'initial');
    }

    const source = sourceDisposable.result.data;

    const markersResult = await this.carbone.extractMarkers(source);

    if (!markersResult.ok) {
      return this.recordNonRenderable(template, 'initial');
    }

    const markers = markersResult.data;

    const {
      passthroughPersonalisation,
      invalidRenderablePersonalisation,
      nonRenderablePersonalisation,
    } = getPersonalisation(markers);

    if (nonRenderablePersonalisation.length > 0) {
      return this.recordNonRenderable(template, 'initial');
    }

    const renderResult = await this.carbone.render(
      source,
      passthroughPersonalisation
    );

    if (!renderResult.ok) {
      return this.recordNonRenderable(template, 'initial');
    }

    const buf = renderResult.data;

    const pagesResult = await this.checkRender.pageCount(buf);

    if (!pagesResult.ok) {
      return this.recordNonRenderable(template, 'initial');
    }

    const { data: pages } = pagesResult;

    const savePdfResult = await this.renderRepo.save(
      buf,
      template,
      'initial',
      pages
    );

    if (!savePdfResult.ok) {
      return this.recordNonRenderable(template, 'initial');
    }

    const { data: filename } = savePdfResult;

    if (invalidRenderablePersonalisation.length > 0) {
      return this.recordRenderedInvalid(template, pages, filename);
    }

    return this.recordRenderedValid(template, 'initial', pages, filename);
  }

  private recordRenderedValid(
    template: TemplateRenderIds,
    renderVariant: RenderVariant,
    pages: number,
    filename: string
  ) {
    return this.templateRepo.update(
      template,
      renderVariant,
      'RENDERED',
      'NOT_YET_SUBMITTED',
      pages,
      filename
    );
  }

  private recordNonRenderable(
    template: TemplateRenderIds,
    renderVariant: RenderVariant
  ) {
    // add specific error details?
    return this.templateRepo.update(
      template,
      renderVariant,
      'FAILED',
      'VALIDATION_FAILED'
    );
  }

  private recordRenderedInvalid(
    template: TemplateRenderIds,
    pages: number,
    filename: string
  ) {
    // add specific error details?
    return this.templateRepo.update(
      template,
      'initial',
      'FAILED',
      'VALIDATION_FAILED',
      pages,
      filename
    );
  }
}
