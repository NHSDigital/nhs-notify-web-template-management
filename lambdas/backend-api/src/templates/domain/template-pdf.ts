import { TemplateKey } from 'nhs-notify-web-template-management-utils';
import type {
  TextItem,
  TextMarkedContent,
} from 'pdfjs-dist/types/src/display/api';

function isTextItem(item: TextItem | TextMarkedContent): item is TextItem {
  return Object.hasOwn(item, 'str');
}

// From https://github.com/NHSDigital/comms-mgr/blob/main/packages/libs/utils/src/constants.ts
export const NAME_PERSONALISATION_LIST = [
  'fullName',
  'firstName',
  'middleNames',
  'lastName',
  'namePrefix',
  'nameSuffix',
];

export const ADDRESS_PERSONALISATIONS = [
  'address_line_1',
  'address_line_2',
  'address_line_3',
  'address_line_4',
  'address_line_5',
  'address_line_6',
  'address_line_7',
];

export const DEFAULT_PERSONALISATION_LIST = [
  ...NAME_PERSONALISATION_LIST,
  ...ADDRESS_PERSONALISATIONS,
  'nhsNumber',
  'date',
  'clientRef',
  'recipientContactValue',
  'template',
];

export class TemplatePdf {
  private parsed = false;

  private parameters: string[] = [];
  constructor(
    private templateKey: TemplateKey,
    private source: Uint8Array
  ) {}

  get templateId(): string {
    return this.templateKey.templateId;
  }

  get clientId(): string {
    return this.templateKey.clientId;
  }

  async parse() {
    if (!this.parsed) {
      const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');

      const loading = getDocument(this.source);

      const document = await loading.promise;

      for (let n = 1; n <= document.numPages; n += 1) {
        const page = await document.getPage(n);
        const textContent = await page.getTextContent();

        // page.getTextContent call above can only return TextItem objects (includeMarkedContent option defaults to false)
        // But method signature returns (TextItem | TextMarkedContent)[]
        // Have to use type-guard to get the right typing
        const parameters = textContent.items
          .filter((item) => isTextItem(item))
          .map((item) => item.str)
          .join('')
          .matchAll(/\(\([^(]*?\)\)/g);

        for (const [param] of parameters) {
          const stripped = param.replaceAll(/[()]/g, '');
          if (!this.parameters.includes(stripped)) {
            this.parameters.push(stripped);
          }
        }
      }

      this.parsed = true;
    }
  }

  get personalisationParameters() {
    if (!this.parsed) {
      throw new Error('PDF has not been parsed');
    }

    return [...this.parameters];
  }

  get defaultPersonalisationParameters() {
    return this.personalisationParameters.filter((param) =>
      DEFAULT_PERSONALISATION_LIST.includes(param)
    );
  }

  get customPersonalisationParameters() {
    return this.personalisationParameters.filter(
      (param) => !DEFAULT_PERSONALISATION_LIST.includes(param)
    );
  }

  get addressLinePersonalisationParameters() {
    return this.personalisationParameters.filter((param) =>
      param.startsWith('address_line_')
    );
  }
}
