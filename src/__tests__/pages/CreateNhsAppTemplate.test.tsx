'use client';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockDeep } from 'jest-mock-extended';
import { FormState } from '../../utils/types';
import { CreateNhsAppTemplate } from '../../components/forms/CreateNhsAppTemplate/CreateNhsAppTemplate';

test('renders page', async () => {
  const user = userEvent.setup();

  const container = render(
    <CreateNhsAppTemplate
      state={mockDeep<FormState>({
        validationError: null,
        nhsAppTemplateName: '',
        nhsAppTemplateMessage: '',
      })}
      action='/action'
    />
  );
  expect(container.asFragment()).toMatchSnapshot();

  const templateNameBox = document.getElementById('nhsAppTemplateName');
  if (!templateNameBox) {
    fail('Template name box not found');
  }
  await user.type(templateNameBox, 'template-name');

  const templateMessageBox = document.getElementById('nhsAppTemplateMessage');
  if (!templateMessageBox) {
    fail('Template message box not found');
  }
  await user.type(templateMessageBox, 'template-message');
});

test('renders page with preloaded field values', () => {
  const container = render(
    <CreateNhsAppTemplate
      state={mockDeep<FormState>({
        validationError: null,
        nhsAppTemplateName: 'template-name',
        nhsAppTemplateMessage: 'template-message',
      })}
      action='/action'
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page one error', () => {
  const container = render(
    <CreateNhsAppTemplate
      state={mockDeep<FormState>({
        validationError: {
          formErrors: [],
          fieldErrors: {
            nhsAppTemplateName: ['Template name error'],
          },
        },
        nhsAppTemplateName: '',
        nhsAppTemplateMessage: '',
      })}
      action='/action'
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page with multiple errors', () => {
  const container = render(
    <CreateNhsAppTemplate
      state={mockDeep<FormState>({
        validationError: {
          formErrors: [],
          fieldErrors: {
            nhsAppTemplateName: ['Template name error'],
            nhsAppTemplateMessage: ['Template message error'],
          },
        },
        nhsAppTemplateName: '',
        nhsAppTemplateMessage: '',
      })}
      action='/action'
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});
