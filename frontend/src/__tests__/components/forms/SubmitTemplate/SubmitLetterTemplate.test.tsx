import { SubmitLetterTemplate } from '@forms/SubmitTemplate/SubmitLetterTemplate';
import { useFeatureFlags } from '@providers/client-config-provider';
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

jest.mock('@providers/client-config-provider');

describe('SubmitLetterTemplate component', () => {
  it('should render with client proofing enabled', () => {
    jest.mocked(useFeatureFlags).mockReturnValueOnce({ proofing: true });

    const container = render(
      <SubmitLetterTemplate
        templateId='template-id'
        templateName='template-name'
        lockNumber={1234}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('should render with client proofing and routing enabled', () => {
    jest
      .mocked(useFeatureFlags)
      .mockReturnValueOnce({ proofing: true, routing: true });

    const container = render(
      <SubmitLetterTemplate
        templateId='template-id'
        templateName='template-name'
        lockNumber={1234}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('should render with client proofing and routing disabled', () => {
    jest.mocked(useFeatureFlags).mockReturnValueOnce({ proofing: false });

    const container = render(
      <SubmitLetterTemplate
        templateId='template-id'
        templateName='template-name'
        lockNumber={1234}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
