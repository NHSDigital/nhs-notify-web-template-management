import { render, screen } from '@testing-library/react';
import CreateTemplate from '@app/create-template/page';
import { useFormState } from 'react-dom';
import { FormState, Page } from '@utils/types';

jest.mock('react-dom', () => ({
  useFormState: jest.fn(),
  ...jest.requireActual('react-dom'),
}));

jest.mock('@app/create-template/main-server-action', () => ({
  mainServerAction: () => {},
}));

const useFormStateMock = useFormState as jest.Mock;

describe('CreateTemplate component', () => {
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
    const initialState: FormState = {
      page: page as Page,
      validationError: undefined,
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    };

    useFormStateMock.mockReturnValue([initialState, '', false]);

    render(<CreateTemplate />);

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });
});
