import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { redirect, RedirectType } from 'next/navigation';
import RenameMessagePlanPage, {
  metadata,
} from '@app/message-plans/rename-message-plan/[routingConfigId]/page';
import { RoutingConfigFactory } from '@testhelpers/routing-config-factory';
import { verifyFormCsrfToken } from '@utils/csrf-utils';
import { getRoutingConfig, updateRoutingConfig } from '@utils/message-plans';
import {
  NextRedirectBoundary,
  NextRedirectError,
} from '@testhelpers/next-redirect';

jest.mock('next/navigation');
jest.mock('@utils/message-plans');
jest.mock('@utils/csrf-utils');

const routingConfig = RoutingConfigFactory.create({
  id: 'd7afdc99-d55b-4f26-8442-2d10aea07346',
  campaignId: 'aff79ee0-4481-4fa3-8a1a-0df53c7b41e5',
});

const errorLogger = console.error;

beforeAll(() => {
  jest.mocked(redirect).mockImplementation((url, type) => {
    throw new NextRedirectError(url, type);
  });
  jest.mocked(getRoutingConfig).mockResolvedValue(routingConfig);
  jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);
  global.console.error = jest.fn(); // suppress error logging in expected error tests
});

afterAll(() => {
  jest.resetAllMocks();
  global.console.error = errorLogger;
});

beforeEach(() => {
  jest.clearAllMocks();
});

test('metadata', () => {
  expect(metadata).toEqual({
    title: 'Rename message plan - NHS Notify',
  });
});

test("it redirects if the routing config isn't found", async () => {
  jest.mocked(getRoutingConfig).mockResolvedValueOnce(undefined);

  await expect(
    RenameMessagePlanPage({
      params: Promise.resolve({ routingConfigId: routingConfig.id }),
      searchParams: Promise.resolve({
        lockNumber: String(routingConfig.lockNumber),
      }),
    })
  ).rejects.toThrow(NextRedirectError);

  expect(getRoutingConfig).toHaveBeenCalledWith(routingConfig.id);

  expect(redirect).toHaveBeenCalledWith(
    '/message-plans/invalid',
    RedirectType.replace
  );
});

it('redirects to the edit message plan page when lockNumber is missing', async () => {
  await expect(
    RenameMessagePlanPage({
      params: Promise.resolve({ routingConfigId: routingConfig.id }),
    })
  ).rejects.toThrow(NextRedirectError);

  expect(getRoutingConfig).not.toHaveBeenCalled();

  expect(redirect).toHaveBeenCalledWith(
    `/message-plans/edit-message-plan/${routingConfig.id}`,
    RedirectType.replace
  );
});

it('redirects to the edit message plan page when lockNumber is invalid', async () => {
  await expect(
    RenameMessagePlanPage({
      params: Promise.resolve({ routingConfigId: routingConfig.id }),
      searchParams: Promise.resolve({ lockNumber: 'not-a-number' }),
    })
  ).rejects.toThrow(NextRedirectError);

  expect(getRoutingConfig).not.toHaveBeenCalled();

  expect(redirect).toHaveBeenCalledWith(
    `/message-plans/edit-message-plan/${routingConfig.id}`,
    RedirectType.replace
  );
});

it('matches snapshot', async () => {
  const page = await RenameMessagePlanPage({
    params: Promise.resolve({ routingConfigId: routingConfig.id }),
    searchParams: Promise.resolve({
      lockNumber: String(routingConfig.lockNumber),
    }),
  });

  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});

it('loads form with saved data filled in', async () => {
  const page = await RenameMessagePlanPage({
    params: Promise.resolve({ routingConfigId: routingConfig.id }),
    searchParams: Promise.resolve({
      lockNumber: String(routingConfig.lockNumber),
    }),
  });

  render(page);

  expect(await screen.findByTestId('name-field')).toHaveValue(
    routingConfig.name
  );
});

it('should not display campaign id field', async () => {
  const page = await RenameMessagePlanPage({
    params: Promise.resolve({ routingConfigId: routingConfig.id }),
    searchParams: Promise.resolve({
      lockNumber: String(routingConfig.lockNumber),
    }),
  });

  render(page);

  expect(screen.queryByTestId('single-campaign-id')).not.toBeInTheDocument();
  expect(screen.queryByTestId('campaign-id-field')).not.toBeInTheDocument();
});

it('renders errors when form is submitted in invalid state', async () => {
  const user = await userEvent.setup();

  const page = await RenameMessagePlanPage({
    params: Promise.resolve({ routingConfigId: routingConfig.id }),
    searchParams: Promise.resolve({
      lockNumber: String(routingConfig.lockNumber),
    }),
  });

  const container = render(page);

  await user.clear(await screen.findByTestId('name-field'));

  await user.click(await screen.findByTestId('submit-button'));

  //  error-summary" test id targets the nested heading rather than the top level of the error summary
  // so we need to assert against the parent element
  await waitFor(async () => {
    const errorSummaryHeading = await screen.getByTestId('error-summary');
    expect(errorSummaryHeading.parentElement).toHaveFocus();
  });

  expect(container.asFragment()).toMatchSnapshot();

  expect(updateRoutingConfig).not.toHaveBeenCalled();
});

it('updates the message plan name and redirects to the edit message plan page', async () => {
  const user = userEvent.setup();

  const page = await RenameMessagePlanPage({
    params: Promise.resolve({ routingConfigId: routingConfig.id }),
    searchParams: Promise.resolve({
      lockNumber: String(routingConfig.lockNumber),
    }),
  });

  render(<NextRedirectBoundary>{page}</NextRedirectBoundary>);

  await user.clear(await screen.findByTestId('name-field'));

  await user.click(screen.getByTestId('name-field'));

  await user.keyboard('New Name');

  await user.click(await screen.findByTestId('submit-button'));

  expect(updateRoutingConfig).toHaveBeenCalledWith(
    routingConfig.id,
    {
      name: 'New Name',
    },
    routingConfig.lockNumber
  );

  expect(redirect).toHaveBeenCalledWith(
    `/message-plans/edit-message-plan/${routingConfig.id}`,
    RedirectType.push
  );
});
