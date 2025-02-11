import { mockDeep } from 'jest-mock-extended';
import { render, screen } from '@testing-library/react';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import {
  EmailTemplate,
  FormState,
  NHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';

describe('ReviewTemplate component', () => {
  beforeEach(jest.resetAllMocks);

  it('matches snapshot', () => {
    const container = render(
      <ReviewTemplate
        sectionHeading='NHS app message template'
        template={mockDeep<NHSAppTemplate>({
          id: 'template-id',
          name: 'Example NHS APP template',
        })}
        form={{
          formId: 'preview-form',
          radiosId: 'preview-example',
          errorHeading: '',
          action: '',
          state: {},
          pageHeading: 'Example heading',
          options: [
            { id: 'option-1', text: 'option 1' },
            { id: 'option-2', text: 'option 2' },
          ],
          buttonText: 'Continue',
          csrfToken: 'csrf-token',
        }}
        PreviewComponent={<>Preview</>}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches error snapshot', () => {
    const state: FormState = {
      validationError: {
        formErrors: [],
        fieldErrors: {
          exampleError: ['Example error'],
        },
      },
    };
    const container = render(
      <ReviewTemplate
        sectionHeading='NHS app message template'
        template={mockDeep<NHSAppTemplate>({
          id: 'template-id',
          name: 'Example NHS APP template',
        })}
        form={{
          formId: 'preview-form',
          radiosId: 'preview-example',
          errorHeading: '',
          action: '',
          state,
          pageHeading: 'Example heading',
          options: [
            { id: 'option-1', text: 'option 1' },
            { id: 'option-2', text: 'option 2' },
          ],
          buttonText: 'Continue',
          csrfToken: 'csrf-token',
        }}
        PreviewComponent={<>Preview</>}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <ReviewTemplate
        sectionHeading='Email template'
        template={mockDeep<EmailTemplate>({
          id: 'template-id',
          name: 'Example template',
        })}
        form={{
          formId: 'preview-form',
          radiosId: 'preview-example',
          errorHeading: '',
          action: '',
          state: {},
          pageHeading: 'Example heading',
          options: [
            { id: 'option-1', text: 'option 1' },
            { id: 'option-2', text: 'option 2' },
          ],
          buttonText: 'Continue',
          csrfToken: 'csrf-token',
        }}
        PreviewComponent={<>Preview</>}
      />
    );

    expect(
      screen.getByTestId('preview-example-form__legend')
    ).toHaveTextContent('Example heading');

    expect(screen.getByTestId('submit-button')).toHaveTextContent('Continue');
  });
});
