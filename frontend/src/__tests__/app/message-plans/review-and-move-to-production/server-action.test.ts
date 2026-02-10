import { redirect } from 'next/navigation';
import { moveToProductionAction } from '@app/message-plans/review-and-move-to-production/[routingConfigId]/server-action';
import { submitRoutingConfig } from '@utils/message-plans';

jest.mock('@utils/message-plans');
jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);
const submitRoutingConfigMock = jest.mocked(submitRoutingConfig);

function createFormData(data: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }
  return formData;
}

describe('actions: moveToProductionAction', () => {
  beforeEach(jest.resetAllMocks);

  it('submits with routingConfigId and lockNumber and redirects to message plans', async () => {
    const formData = createFormData({
      routingConfigId: 'rc-123',
      lockNumber: '5',
    });

    await moveToProductionAction({}, formData);
    expect(submitRoutingConfig).toHaveBeenCalledWith('rc-123', 5);
    expect(redirectMock).toHaveBeenCalledWith('/message-plans', 'replace');
  });

  it('returns error state when routingConfigId is missing', async () => {
    const formData = createFormData({
      lockNumber: '5',
    });

    const result = await moveToProductionAction({}, formData);

    expect(result.errorState).toBeDefined();
    expect(submitRoutingConfig).not.toHaveBeenCalled();
  });

  it('returns error state when lockNumber is invalid', async () => {
    const formData = createFormData({
      routingConfigId: 'rc-123',
      lockNumber: 'invalid',
    });

    const result = await moveToProductionAction({}, formData);

    expect(result.errorState).toBeDefined();
    expect(submitRoutingConfig).not.toHaveBeenCalled();
  });

  it('propagates error when submitRoutingConfig fails', async () => {
    const formData = createFormData({
      routingConfigId: 'rc-123',
      lockNumber: '5',
    });

    submitRoutingConfigMock.mockRejectedValueOnce(
      new Error('Failed to submit message plan')
    );

    await expect(moveToProductionAction({}, formData)).rejects.toThrow(
      'Failed to submit message plan'
    );

    expect(submitRoutingConfig).toHaveBeenCalledWith('rc-123', 5);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('clears previous error state on successful validation', async () => {
    const formData = createFormData({
      routingConfigId: 'rc-123',
      lockNumber: '5',
    });

    const previousState = {
      errorState: {
        formErrors: ['Previous error'],
        fieldErrors: {},
      },
    };

    await moveToProductionAction(previousState, formData);

    expect(submitRoutingConfig).toHaveBeenCalledWith('rc-123', 5);
    expect(redirectMock).toHaveBeenCalledWith('/message-plans', 'replace');
  });
});
