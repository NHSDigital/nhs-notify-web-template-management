import { RequestProof } from '@forms/RequestProof/RequestProof';
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

jest.mock('@forms/RequestProof/server-action', () => ({
  requestTemplateProof: '/action',
}));

describe('RequestProof component', () => {
  it('should render', () => {
    const container = render(
      <RequestProof
        templateId='template-id'
        templateName='template-name'
        channel='LETTER'
        lockNumber={18}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
