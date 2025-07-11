import { SubmitLetterTemplate } from '@forms/SubmitTemplate/SubmitLetterTemplate';
import { render } from '@testing-library/react';

jest.mock('@utils/amplify-utils');

jest.mock('react', () => {
  const originalModule = jest.requireActual('react');

  return {
    ...originalModule,
    useActionState: jest.fn((action, initialState) => {
      return [initialState, action];
    }),
  };
});

jest.mock('@forms/SubmitTemplate/server-action', () => ({
  submitTemplate: '/action',
}));

const OLD_ENV = { ...process.env };

beforeEach(() => {
  process.env.NEXT_PUBLIC_ENABLE_PROOFING = 'true';
});

afterAll(() => {
  process.env = OLD_ENV;
});

describe('SubmitLetterTemplate component', () => {
  it('should render', () => {
    const container = render(
      <SubmitLetterTemplate
        templateId='template-id'
        templateName='template-name'
        proofingEnabled={true}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('should render with proofing flag disabled', () => {
    process.env.NEXT_PUBLIC_ENABLE_PROOFING = 'false';

    const container = render(
      <SubmitLetterTemplate
        templateId='template-id'
        templateName='template-name'
        proofingEnabled={false}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
