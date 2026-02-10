import { mockDeep } from 'jest-mock-extended';
import { render, screen } from '@testing-library/react';
import { PreviewDigitalTemplate } from '@organisms/PreviewDigitalTemplate';
import {
  EmailTemplate,
  FormState,
  NHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { useFeatureFlags } from '@providers/client-config-provider';

jest.mock('@providers/client-config-provider');

beforeEach(() => {
  jest.mocked(useFeatureFlags).mockReset();
});

describe('PreviewDigitalTemplate', () => {
  describe('Routing disabled with letter authoring disabled', () => {
    beforeEach(() => {
      jest.mocked(useFeatureFlags).mockReturnValue({ routing: false });
      jest.mocked(useFeatureFlags).mockReturnValue({ letterAuthoring: false });
    });

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
          editPath='/edit-nhs-app-template/template-id'
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
          editPath='/edit-nhs-app-template/template-id'
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
            name: 'Example template - routing disabled',
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
          editPath='/edit-nhs-app-template/template-id'
        />
      );

      expect(
        screen.getByTestId('preview-example-form__legend')
      ).toHaveTextContent('Example heading');

      expect(screen.getByTestId('submit-button')).toBeVisible();
    });
  });

  describe('Routing enabled with letter authoring disabled', () => {
    beforeEach(() => {
      jest.mocked(useFeatureFlags).mockReturnValue({ routing: true });
      jest.mocked(useFeatureFlags).mockReturnValue({ letterAuthoring: false });
    });

    it('matches snapshot', () => {
      const container = render(
        <PreviewDigitalTemplate
          sectionHeading={undefined}
          template={mockDeep<NHSAppTemplate>({
            id: 'template-id',
            name: 'Example NHS APP template',
          })}
          editPath='/edit-nhs-app-template/template-id'
          previewDetailsComponent={<>Preview</>}
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
        />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('renders component correctly', () => {
      render(
        <PreviewDigitalTemplate
          sectionHeading='Email template - routing enabled'
          template={mockDeep<NHSAppTemplate>({
            id: 'template-id',
            name: 'Example NHS APP template',
          })}
          editPath='/edit-nhs-app-template/template-id'
          previewDetailsComponent={<>Preview</>}
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
        />
      );

      expect(screen.getByTestId('edit-template-button')).toBeVisible();
    });
  });
});
