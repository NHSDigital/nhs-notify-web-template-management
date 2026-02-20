'use client';

import { fireEvent, render, screen } from '@testing-library/react';
import { PreviewNHSAppTemplate } from '@forms/PreviewNHSAppTemplate';
import {
  NHSAppTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { renderNHSAppMarkdown } from '@utils/markdownit';
import { mockDeep } from 'jest-mock-extended';
import { useSearchParams } from 'next/navigation';
import { useFeatureFlags } from '@providers/client-config-provider';

jest.mock('@utils/markdownit');

jest.mock('react', () => {
  const originalModule = jest.requireActual('react');

  return {
    ...originalModule,
    useActionState: (
      _: (
        formState: TemplateFormState,
        formData: FormData
      ) => Promise<TemplateFormState>,
      initialState: TemplateFormState
    ) => [initialState, '/action'],
  };
});

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => undefined),
  })),
}));

jest.mock('@providers/client-config-provider');

beforeEach(() => {
  jest.mocked(useFeatureFlags).mockReset().mockReturnValue({});
});

describe('Preview nhs app form renders', () => {
  describe('Routing feature flag - Disabled', () => {
    beforeEach(() => {
      jest
        .mocked(useFeatureFlags)
        .mockReturnValue({ routing: false, letterAuthoring: true });
    });

    it('matches error snapshot', () => {
      const container = render(
        <PreviewNHSAppTemplate
          initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
            errorState: {
              formErrors: [],
              fieldErrors: {
                previewNHSAppTemplateAction: ['Select an option'],
              },
            },
            id: 'template-id',
            name: 'test-template-nhs app',
            templateStatus: 'NOT_YET_SUBMITTED',
            message: 'message',
          })}
        />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('renders component correctly', () => {
      render(
        <PreviewNHSAppTemplate
          initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
            errorState: undefined,
            id: 'template-id',
            name: 'test-template-nhs app',
            templateStatus: 'NOT_YET_SUBMITTED',
            message: 'message',
          })}
        />
      );

      expect(screen.getByTestId('nhsapp-edit-radio')).toHaveAttribute(
        'value',
        'nhsapp-edit'
      );

      expect(screen.getByTestId('nhsapp-submit-radio')).toHaveAttribute(
        'value',
        'nhsapp-submit'
      );
    });

    test('Client-side validation triggers', () => {
      const container = render(
        <PreviewNHSAppTemplate
          initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
            id: 'template-id',
            name: 'test-template-nhs app',
            templateStatus: 'NOT_YET_SUBMITTED',
            message: 'example',
          })}
        />
      );
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      expect(container.asFragment()).toMatchSnapshot();
    });
  });

  describe('Routing feature flag - Enabled', () => {
    beforeEach(() => {
      jest
        .mocked(useFeatureFlags)
        .mockReturnValue({ routing: true, letterAuthoring: true });
    });

    it('renders component correctly', () => {
      render(
        <PreviewNHSAppTemplate
          initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
            errorState: undefined,
            id: 'template-id',
            name: 'test-template-nhs app',
            templateStatus: 'NOT_YET_SUBMITTED',
            message: 'message',
          })}
        />
      );

      expect(screen.getByTestId('edit-template-button')).toHaveAttribute(
        'href',
        '/edit-nhs-app-template/template-id'
      );
    });
  });

  it.each([true, false])(
    'matches snapshot when navigating from manage templates screen when routing is %p',
    (routing) => {
      jest
        .mocked(useFeatureFlags)
        .mockReturnValue({ routing, letterAuthoring: true });

      const container = render(
        <PreviewNHSAppTemplate
          initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
            errorState: undefined,
            id: 'template-id',
            name: 'test-template-nhs app',
            templateStatus: 'NOT_YET_SUBMITTED',
            message: 'message',
          })}
        />
      );

      expect(container.asFragment()).toMatchSnapshot();
    }
  );

  it.each([true, false])(
    'matches snapshot when navigating from edit screen when routing is %p',
    (routing) => {
      jest
        .mocked(useFeatureFlags)
        .mockReturnValue({ routing, letterAuthoring: true });

      const mockSearchParams = new Map([['from', 'edit']]);
      (useSearchParams as jest.Mock).mockImplementationOnce(() => ({
        get: (key: string) => mockSearchParams.get(key),
      }));

      const container = render(
        <PreviewNHSAppTemplate
          initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
            errorState: undefined,
            id: 'template-id',
            name: 'test-template-nhs app',
            templateStatus: 'NOT_YET_SUBMITTED',
            message: 'message',
          })}
        />
      );

      expect(container.asFragment()).toMatchSnapshot();
    }
  );

  it('should render message with markdown', () => {
    const renderMock = jest.mocked(renderNHSAppMarkdown);

    renderMock.mockReturnValue('Rendered via MD');

    const message = 'nhs app message body';

    render(
      <PreviewNHSAppTemplate
        initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
          errorState: undefined,
          id: 'template-id',
          name: 'test-template-nhs app',
          templateStatus: 'NOT_YET_SUBMITTED',
          message,
        })}
      />
    );

    expect(renderMock).toHaveBeenCalledWith(message);

    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'Rendered via MD'
    );
  });
});
