import { ChooseChannelTemplate } from '@forms/ChooseChannelTemplate';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  EMAIL_TEMPLATE,
  LETTER_TEMPLATE,
  NHS_APP_TEMPLATE,
  ROUTING_CONFIG,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import { useActionState } from 'react';
import { ChooseChannelTemplateFormState } from '@forms/ChooseChannelTemplate/server-action';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation');

jest.mock('react', () => {
  const originalModule = jest.requireActual('react');

  return {
    ...originalModule,
    useActionState: jest
      .fn()
      .mockImplementation(
        (
          _: (
            formState: ChooseChannelTemplateFormState,
            formData: FormData
          ) => Promise<ChooseChannelTemplateFormState>,
          initialState: ChooseChannelTemplateFormState
        ) => [initialState, '/action']
      ),
  };
});

jest
  .mocked(usePathname)
  .mockReturnValue('message-plans/choose-email-template/testid');

describe('ChooseChannelTemplate', () => {
  it('renders nhs app form', () => {
    const container = render(
      <ChooseChannelTemplate
        messagePlan={ROUTING_CONFIG}
        pageHeading='Choose an NHS App template'
        templateList={[NHS_APP_TEMPLATE]}
        cascadeIndex={0}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders email form', () => {
    const container = render(
      <ChooseChannelTemplate
        messagePlan={ROUTING_CONFIG}
        pageHeading='Choose an email template'
        templateList={[EMAIL_TEMPLATE]}
        cascadeIndex={1}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders sms form', () => {
    const container = render(
      <ChooseChannelTemplate
        messagePlan={ROUTING_CONFIG}
        pageHeading='Choose a text message (SMS) template'
        templateList={[SMS_TEMPLATE]}
        cascadeIndex={2}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders letter form', () => {
    const container = render(
      <ChooseChannelTemplate
        messagePlan={ROUTING_CONFIG}
        pageHeading='Choose a letter template'
        templateList={[LETTER_TEMPLATE]}
        cascadeIndex={3}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders multiple options', () => {
    const container = render(
      <ChooseChannelTemplate
        messagePlan={ROUTING_CONFIG}
        pageHeading='Choose an NHS App template'
        templateList={[
          NHS_APP_TEMPLATE,
          { ...NHS_APP_TEMPLATE, id: 'another-id', name: 'Another template' },
        ]}
        cascadeIndex={0}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders correctly when template is unselected', () => {
    const container = render(
      <ChooseChannelTemplate
        messagePlan={{
          ...ROUTING_CONFIG,
          cascade: [
            {
              cascadeGroups: ['standard'],
              channel: 'NHSAPP',
              channelType: 'primary',
              defaultTemplateId: null,
            },
          ],
        }}
        pageHeading='Choose an NHS App template'
        templateList={[NHS_APP_TEMPLATE]}
        cascadeIndex={0}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders correctly when no templates are available', () => {
    const container = render(
      <ChooseChannelTemplate
        messagePlan={{
          ...ROUTING_CONFIG,
          cascade: [
            {
              cascadeGroups: ['standard'],
              channel: 'NHSAPP',
              channelType: 'primary',
              defaultTemplateId: null,
            },
          ],
        }}
        pageHeading='Choose an NHS App template'
        templateList={[]}
        cascadeIndex={0}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders error component', () => {
    const mockUseActionState = jest.fn().mockReturnValue([
      {
        errorState: {
          formErrors: [],
          fieldErrors: {
            channelTemplate: ['You must select a template'],
          },
        },
      },
      '/action',
    ]);

    jest.mocked(useActionState).mockImplementation(mockUseActionState);

    const container = render(
      <ChooseChannelTemplate
        messagePlan={ROUTING_CONFIG}
        pageHeading='Choose an NHS App template'
        templateList={[NHS_APP_TEMPLATE]}
        cascadeIndex={0}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  test('Client-side validation triggers', () => {
    const container = render(
      <ChooseChannelTemplate
        messagePlan={{
          ...ROUTING_CONFIG,
          cascade: [
            {
              cascadeGroups: ['standard'],
              channel: 'NHSAPP',
              channelType: 'primary',
              defaultTemplateId: null,
            },
          ],
        }}
        pageHeading='Choose an NHS App template'
        templateList={[NHS_APP_TEMPLATE]}
        cascadeIndex={0}
      />
    );
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    expect(container.asFragment()).toMatchSnapshot();
  });
});
