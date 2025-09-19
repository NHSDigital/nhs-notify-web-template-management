import { mockDeep } from 'jest-mock-extended';
import { render, screen } from '@testing-library/react';
import {
  PreviewDigitalTemplate,
  PreviewDigitalTemplateEditOnly,
} from '@organisms/PreviewDigitalTemplate';
import {
  EmailTemplate,
  FormState,
  NHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';

describe('PreviewDigitalTemplate', () => {
  beforeEach(jest.resetAllMocks);

  it('matches snapshot', () => {
    const container = render(
      <PreviewDigitalTemplate
        sectionHeading='NHS app message template'
        template={mockDeep<NHSAppTemplate>({
          id: 'template-id',
          name: 'Example NHS APP template',
        })}
        form={{
          formId: 'preview-form',
          radiosId: 'preview-example',
          action: '',
          state: {},
          pageHeading: 'Example heading',
          options: [
            { id: 'option-1', text: 'option 1' },
            { id: 'option-2', text: 'option 2' },
          ],
          buttonText: 'Continue',
        }}
        previewDetailsComponent={<>Preview</>}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches error snapshot', () => {
    const state: FormState = {
      errorState: {
        formErrors: [],
        fieldErrors: {
          exampleError: ['Example error'],
        },
      },
    };
    const container = render(
      <PreviewDigitalTemplate
        sectionHeading='NHS app message template'
        template={mockDeep<NHSAppTemplate>({
          id: 'template-id',
          name: 'Example NHS APP template',
        })}
        form={{
          formId: 'preview-form',
          radiosId: 'preview-example',
          action: '',
          state,
          pageHeading: 'Example heading',
          options: [
            { id: 'option-1', text: 'option 1' },
            { id: 'option-2', text: 'option 2' },
          ],
          buttonText: 'Continue',
        }}
        previewDetailsComponent={<>Preview</>}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <PreviewDigitalTemplate
        sectionHeading='Email template'
        template={mockDeep<EmailTemplate>({
          id: 'template-id',
          name: 'Example template',
        })}
        form={{
          formId: 'preview-form',
          radiosId: 'preview-example',
          action: '',
          state: {},
          pageHeading: 'Example heading',
          options: [
            { id: 'option-1', text: 'option 1' },
            { id: 'option-2', text: 'option 2' },
          ],
          buttonText: 'Continue',
        }}
        previewDetailsComponent={<>Preview</>}
      />
    );

    expect(
      screen.getByTestId('preview-example-form__legend')
    ).toHaveTextContent('Example heading');

    expect(screen.getByTestId('submit-button')).toHaveTextContent('Continue');
  });
});

describe('PreviewDigitalTemplateEditOnly', () => {
  it('matches snapshot', () => {
    const container = render(
      <PreviewDigitalTemplateEditOnly
        sectionHeading={undefined}
        template={mockDeep<NHSAppTemplate>({
          id: 'template-id',
          name: 'Example NHS APP template',
        })}
        editPath='/edit-nhs-app-template/template-id'
        previewDetailsComponent={<>Preview</>}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot with section heading', () => {
    const container = render(
      <PreviewDigitalTemplateEditOnly
        sectionHeading='Template saved'
        template={mockDeep<NHSAppTemplate>({
          id: 'template-id',
          name: 'Example NHS APP template',
        })}
        editPath='/edit-nhs-app-template/template-id'
        previewDetailsComponent={<>Preview</>}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
