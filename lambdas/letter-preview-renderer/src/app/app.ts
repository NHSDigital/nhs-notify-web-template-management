import { InitialRenderRequest } from 'nhs-notify-backend-client/src/types/render-request';
import { SourceRepository } from '../infra/source-repository';
import { Carbone } from '../infra/carbone';
import { RenderRepository } from '../infra/render-repository';
import { TemplateRepository } from '../infra/template-repository';

export class App {
  constructor(
    private readonly sourceRepo: SourceRepository,
    private readonly carbone: Carbone,
    private readonly renderRepo: RenderRepository,
    private readonly templateRepo: TemplateRepository
  ) {}

  async renderInitial(
    request: InitialRenderRequest
  ): Promise<{ ok: true } | { ok: false }> {
    const { templateId, clientId } = request;

    await using source = await this.sourceRepo.getSource(templateId, clientId);

    // get personalisation from source

    // stop if unrenderable

    const buf = await this.carbone.render(source.path, {});

    // page count

    await this.renderRepo.save(buf, templateId, clientId);

    await this.templateRepo.recordInitialRender(
      templateId,
      clientId,
      0,
      'filename',
      'NOT_YET_SUBMITTED'
    );

    return { ok: true };
  }
}
