import { submitRoutingConfig } from '../../../../utils/message-plans';
import { moveToProduction } from './actions';
import { redirect, RedirectType } from 'next/navigation';

jest.mock('../../../../utils/message-plans', () => ({
  submitRoutingConfig: jest.fn(),
}));

type RedirectFn = typeof redirect & { url?: string; type?: RedirectType };
jest.mock('next/navigation', () => ({
  redirect: ((url?: string, type?: RedirectType) => {
    (redirect as RedirectFn).url = url;
    (redirect as RedirectFn).type = type;
    throw Object.assign(new Error('NEXT_REDIRECT'), { url, type });
  }) as RedirectFn,
  RedirectType: { replace: 'replace' },
}));

describe('actions: moveToProduction', () => {
  it('submits with routingConfigId and lockNumber and redirects to message plans', async () => {
    await expect(moveToProduction('rc-123', 5)).rejects.toMatchObject({
      url: '/message-plans',
    });
    expect(submitRoutingConfig).toHaveBeenCalledWith('rc-123', 5);
  });
});
