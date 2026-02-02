import { LanguageLetterTemplates } from '@molecules/LanguageLetterTemplates/LanguageLetterTemplates';
import {
  AUTHORING_LETTER_TEMPLATE,
  PDF_LETTER_TEMPLATE,
} from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { LetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('next/navigation');

jest
  .mocked(usePathname)
  .mockReturnValue(
    'message-plans/choose-other-language-letter-template/testid'
  );

const FRENCH_LETTER_TEMPLATE: LetterTemplate = {
  ...PDF_LETTER_TEMPLATE,
  id: 'french-template-id',
  name: 'French Letter Template',
  language: 'fr',
};

const POLISH_LETTER_TEMPLATE: LetterTemplate = {
  ...PDF_LETTER_TEMPLATE,
  id: 'polish-template-id',
  name: 'Polish Letter Template',
  language: 'pl',
};

const GERMAN_LETTER_TEMPLATE: LetterTemplate = {
  ...PDF_LETTER_TEMPLATE,
  id: 'german-template-id',
  name: 'German Letter Template',
  language: 'de',
};

const FRENCH_AUTHORING_LETTER_TEMPLATE: LetterTemplate = {
  ...AUTHORING_LETTER_TEMPLATE,
  id: 'french-authoring-template-id',
  name: 'French Authoring Letter Template',
  language: 'fr',
};

describe('LanguageLetterTemplates', () => {
  it('renders list of foreign language letter templates', () => {
    const container = render(
      <form>
        <LanguageLetterTemplates
          templateList={[
            FRENCH_LETTER_TEMPLATE,
            POLISH_LETTER_TEMPLATE,
            GERMAN_LETTER_TEMPLATE,
          ]}
          errorState={null}
          selectedTemplates={[]}
          routingConfigId='routing-config-id'
          lockNumber={5}
        />
      </form>
    );

    expect(container.asFragment()).toMatchSnapshot();
    expect(container.getByText('French Letter Template')).toBeInTheDocument();
    expect(container.getByText('Polish Letter Template')).toBeInTheDocument();
    expect(container.getByText('German Letter Template')).toBeInTheDocument();
  });

  it('renders templates list with pre-selected templates', () => {
    const container = render(
      <form>
        <LanguageLetterTemplates
          templateList={[
            FRENCH_LETTER_TEMPLATE,
            POLISH_LETTER_TEMPLATE,
            GERMAN_LETTER_TEMPLATE,
          ]}
          errorState={null}
          selectedTemplates={[
            FRENCH_LETTER_TEMPLATE.id,
            POLISH_LETTER_TEMPLATE.id,
          ]}
          routingConfigId='routing-config-id'
          lockNumber={5}
        />
      </form>
    );

    expect(container.asFragment()).toMatchSnapshot();
    expect(
      container.getByTestId(`${FRENCH_LETTER_TEMPLATE.id}-checkbox`)
    ).toBeChecked();
    expect(
      container.getByTestId(`${POLISH_LETTER_TEMPLATE.id}-checkbox`)
    ).toBeChecked();
    expect(
      container.getByTestId(`${GERMAN_LETTER_TEMPLATE.id}-checkbox`)
    ).not.toBeChecked();
  });

  it('renders templates with error state', () => {
    const container = render(
      <form>
        <LanguageLetterTemplates
          templateList={[
            FRENCH_LETTER_TEMPLATE,
            POLISH_LETTER_TEMPLATE,
            GERMAN_LETTER_TEMPLATE,
          ]}
          errorState={{
            fieldErrors: {
              'language-templates': [
                'Please select at least one language template',
              ],
            },
          }}
          selectedTemplates={[]}
          routingConfigId='routing-config-id'
          lockNumber={5}
        />
      </form>
    );

    expect(container.asFragment()).toMatchSnapshot();
    expect(
      container.getByText('Please select at least one language template')
    ).toBeInTheDocument();
  });

  it('renders templates with duplicate language error state', () => {
    const container = render(
      <form>
        <LanguageLetterTemplates
          templateList={[
            FRENCH_LETTER_TEMPLATE,
            POLISH_LETTER_TEMPLATE,
            GERMAN_LETTER_TEMPLATE,
          ]}
          errorState={{
            fieldErrors: {
              'language-templates': [
                'Choose only one template for each language',
              ],
            },
          }}
          selectedTemplates={[]}
          routingConfigId='routing-config-id'
          lockNumber={5}
        />
      </form>
    );

    expect(container.asFragment()).toMatchSnapshot();
    expect(
      container.getByText('Choose only one template for each language')
    ).toBeInTheDocument();
  });

  it('renders preview links with correct hrefs for each template', () => {
    const container = render(
      <form>
        <LanguageLetterTemplates
          templateList={[FRENCH_LETTER_TEMPLATE, POLISH_LETTER_TEMPLATE]}
          errorState={null}
          selectedTemplates={[]}
          routingConfigId='test-routing-id'
          lockNumber={5}
        />
      </form>
    );

    const previewLinkFrench = container.getByTestId(
      `${FRENCH_LETTER_TEMPLATE.id}-preview-link`
    );
    expect(previewLinkFrench).toHaveAttribute(
      'href',
      '/message-plans/choose-other-language-letter-template/test-routing-id/preview-template/french-template-id?lockNumber=5'
    );
    const previewLinkPolish = container.getByTestId(
      `${POLISH_LETTER_TEMPLATE.id}-preview-link`
    );
    expect(previewLinkPolish).toHaveAttribute(
      'href',
      '/message-plans/choose-other-language-letter-template/test-routing-id/preview-template/polish-template-id?lockNumber=5'
    );
  });

  it('renders correct checkbox names for form submission', () => {
    const container = render(
      <form>
        <LanguageLetterTemplates
          templateList={[FRENCH_LETTER_TEMPLATE, POLISH_LETTER_TEMPLATE]}
          errorState={null}
          selectedTemplates={[]}
          routingConfigId='routing-config-id'
          lockNumber={5}
        />
      </form>
    );

    const frenchCheckbox = container.getByTestId(
      `${FRENCH_LETTER_TEMPLATE.id}-checkbox`
    );
    const polishCheckbox = container.getByTestId(
      `${POLISH_LETTER_TEMPLATE.id}-checkbox`
    );

    expect(frenchCheckbox).toHaveAttribute(
      'name',
      `template_${FRENCH_LETTER_TEMPLATE.id}`
    );
    expect(polishCheckbox).toHaveAttribute(
      'name',
      `template_${POLISH_LETTER_TEMPLATE.id}`
    );
  });

  it('renders list of mixed PDF and authoring letter templates', () => {
    const container = render(
      <form>
        <LanguageLetterTemplates
          templateList={[
            FRENCH_LETTER_TEMPLATE,
            FRENCH_AUTHORING_LETTER_TEMPLATE,
            GERMAN_LETTER_TEMPLATE,
          ]}
          errorState={null}
          selectedTemplates={[FRENCH_AUTHORING_LETTER_TEMPLATE.id]}
          routingConfigId='routing-config-id'
          lockNumber={5}
        />
      </form>
    );

    expect(container.asFragment()).toMatchSnapshot();
    expect(container.getByText('French Letter Template')).toBeInTheDocument();
    expect(
      container.getByText('French Authoring Letter Template')
    ).toBeInTheDocument();
    expect(container.getByText('German Letter Template')).toBeInTheDocument();
    expect(
      container.getByTestId(`${FRENCH_AUTHORING_LETTER_TEMPLATE.id}-checkbox`)
    ).toBeChecked();
  });
});
