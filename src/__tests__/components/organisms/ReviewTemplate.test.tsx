import { render, screen } from '@testing-library/react';
import { ReviewTemplate } from '@organisms/ReviewTemplate';
import { FormState } from '@utils/types';
import { mockDeep } from 'jest-mock-extended';

const mockState = mockDeep<FormState>({
  validationError: undefined,
});

describe('ReviewTemplate component', () => {
  beforeEach(jest.resetAllMocks);

  it('matches snapshot', () => {
    const container = render(
      <ReviewTemplate
        sectionHeading='NHS app message template'
        templateName='Example NHS APP template'
        details={{
          heading: 'Details heading',
          text: [{ id: 'example-1', text: 'Details text' }],
        }}
        form={{
          formId: 'preview-form',
          radiosId: 'preview-example',
          errorHeading: '',
          action: '',
          state: mockState,
          pageHeading: 'Example heading',
          options: [
            { id: 'option-1', text: 'option 1' },
            { id: 'option-2', text: 'option 2' },
          ],
          buttonText: 'Continue',
        }}
        PreviewComponent={<>Preview</>}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches error snapshot', () => {
    const state: FormState = {
      ...mockState,
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
        templateName='Example NHS APP template'
        details={{
          heading: 'Details heading',
          text: [{ id: 'example-1', text: 'Details text' }],
        }}
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
        templateName='Example template'
        details={{
          heading: 'Details heading',
          text: [{ id: 'example-1', text: 'Details text' }],
        }}
        form={{
          formId: 'preview-form',
          radiosId: 'preview-example',
          errorHeading: '',
          action: '',
          state: mockState,
          pageHeading: 'Example heading',
          options: [
            { id: 'option-1', text: 'option 1' },
            { id: 'option-2', text: 'option 2' },
          ],
          buttonText: 'Continue',
        }}
        PreviewComponent={<>Preview</>}
      />
    );

    expect(
      screen.getByTestId('preview-message__heading-caption')
    ).toHaveTextContent('Email template');

    expect(screen.getByTestId('preview-message__heading')).toHaveTextContent(
      'Example template'
    );

    expect(
      screen.getByTestId('preview-message-details__heading')
    ).toHaveTextContent('Details heading');

    expect(
      screen.getByTestId('preview-message-details__text')
    ).toHaveTextContent('Details text');

    expect(
      screen.getByTestId('preview-example-form__legend')
    ).toHaveTextContent('Example heading');

    expect(screen.getByTestId('submit-button')).toHaveTextContent('Continue');
  });
});
