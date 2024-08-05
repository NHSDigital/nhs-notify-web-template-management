import { render, screen } from '@testing-library/react';
import { CreateTemplateSinglePage } from '@molecules/CreateTemplateSinglePage/CreateTemplateSinglePage';
import { useFormState } from 'react-dom';
import { Page, TemplateFormState, TemplateType } from '@/src/utils/types';

jest.mock('react-dom', () => ({
  useFormState: jest.fn(),
  ...jest.requireActual('react-dom'),
}));

jest.mock('@/src/app/create-template/main-server-action', () => ({
  mainServerAction: () => {},
}));

const useFormStateMock = useFormState as jest.Mock;

describe('CreateTemplateSinglePage component', () => {
  test.each([
    {
      page: 'choose-template' satisfies Page,
      heading: 'Choose a template type to create',
    },
    {
      page: 'create-nhs-app-template' satisfies Page,
      heading: 'Create NHS App message template',
    },
    {
      page: 'create-email-template' satisfies Page,
      heading: 'Placeholder email page',
    },
    {
      page: 'create-sms-template' satisfies Page,
      heading: 'Placeholder SMS page',
    },
    {
      page: 'create-letter-template' satisfies Page,
      heading: 'Placeholder letter page',
    },
    {
      page: 'review-nhs-app-template' satisfies Page,
      heading: 'NHS App message template',
    },
    {
      page: 'submit-template' satisfies Page,
      heading: 'Placeholder Submit template',
    },
  ])('Should render %s', ({ page, heading }) => {
    const initialState: TemplateFormState = {
      sessionId: 'session-id',
      page: page as Page,
      validationError: undefined,
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    };

    useFormStateMock.mockReturnValue([initialState, '', false]);

    render(<CreateTemplateSinglePage initialState={initialState} />);

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });
});
