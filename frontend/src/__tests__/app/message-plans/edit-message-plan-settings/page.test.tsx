import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { redirect, RedirectType } from 'next/navigation';
import EditMessagePlanPage, {
  metadata,
} from '@app/message-plans/edit-message-plan-settings/[routingConfigId]/page';
import { RoutingConfigFactory } from '@testhelpers/routing-config-factory';
import { verifyFormCsrfToken } from '@utils/csrf-utils';
import { getRoutingConfig, updateRoutingConfig } from '@utils/message-plans';
import { fetchClient } from '@utils/server-features';
import {
  NextRedirectBoundary,
  NextRedirectError,
} from '@testhelpers/next-redirect';

jest.mock('next/navigation');
jest.mock('@utils/message-plans');
jest.mock('@utils/server-features');
jest.mock('@utils/csrf-utils');

const routingConfig = RoutingConfigFactory.create({
  id: 'd7afdc99-d55b-4f26-8442-2d10aea07346',
  campaignId: 'aff79ee0-4481-4fa3-8a1a-0df53c7b41e5',
});

beforeAll(() => {
  jest.mocked(redirect).mockImplementation((url, type) => {
    throw new NextRedirectError(url, type);
  });
  jest.mocked(getRoutingConfig).mockResolvedValue(routingConfig);
  jest.mocked(fetchClient).mockResolvedValue({ features: {}, campaignIds: [] });
  jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);
});

beforeEach(() => {
  jest.clearAllMocks();
});

test('metadata', () => {
  expect(metadata).toEqual({
    title: 'Edit message plan settings - NHS Notify',
  });
});

test("it redirects if the routing config isn't found", async () => {
  jest.mocked(getRoutingConfig).mockResolvedValueOnce(undefined);

  await expect(
    EditMessagePlanPage({
      params: Promise.resolve({ routingConfigId: routingConfig.id }),
    })
  ).rejects.toThrow(NextRedirectError);

  expect(getRoutingConfig).toHaveBeenCalledWith(routingConfig.id);

  expect(redirect).toHaveBeenCalledWith(
    '/message-plans/invalid',
    RedirectType.replace
  );
});

test('it redirects if the client has no campaign ids', async () => {
  await expect(
    EditMessagePlanPage({
      params: Promise.resolve({ routingConfigId: routingConfig.id }),
    })
  ).rejects.toThrow(NextRedirectError);

  expect(redirect).toHaveBeenCalledWith(
    '/message-plans/campaign-id-required',
    RedirectType.replace
  );
});

describe('single campaign', () => {
  beforeEach(() => {
    jest.mocked(fetchClient).mockResolvedValue({
      features: {},
      campaignIds: [routingConfig.campaignId],
    });
  });

  it('matches snapshot', async () => {
    const page = await EditMessagePlanPage({
      params: Promise.resolve({ routingConfigId: routingConfig.id }),
    });

    const container = render(page);

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('loads form with saved data filled in', async () => {
    const page = await EditMessagePlanPage({
      params: Promise.resolve({ routingConfigId: routingConfig.id }),
    });

    render(page);

    expect(await screen.findByTestId('name-field')).toHaveValue(
      routingConfig.name
    );

    expect(await screen.findByTestId('single-campaign-id')).toHaveTextContent(
      routingConfig.campaignId
    );
  });

  it('renders errors when form is submitted in invalid state', async () => {
    const user = await userEvent.setup();

    const page = await EditMessagePlanPage({
      params: Promise.resolve({ routingConfigId: routingConfig.id }),
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

  it('updates the message plan and redirects to the choose templates page', async () => {
    const user = await userEvent.setup();

    const page = await EditMessagePlanPage({
      params: Promise.resolve({ routingConfigId: routingConfig.id }),
    });

    render(<NextRedirectBoundary>{page}</NextRedirectBoundary>);

    await user.clear(await screen.findByTestId('name-field'));

    await user.click(await screen.getByTestId('name-field'));

    await user.keyboard('New Name');

    await user.click(await screen.findByTestId('submit-button'));

    expect(updateRoutingConfig).toHaveBeenCalledWith(routingConfig.id, {
      name: 'New Name',
      campaignId: routingConfig.campaignId,
    });

    expect(redirect).toHaveBeenCalledWith(
      `/message-plans/choose-templates/${routingConfig.id}`,
      RedirectType.push
    );
  });
});

describe('multiple campaigns', () => {
  const alternateCampaignId = '9e24950f-1d9b-416b-affd-50f142fb0873';
  beforeEach(() => {
    jest.mocked(fetchClient).mockResolvedValue({
      features: {},
      campaignIds: [routingConfig.campaignId, alternateCampaignId],
    });
  });

  it('matches snapshot', async () => {
    const page = await EditMessagePlanPage({
      params: Promise.resolve({ routingConfigId: routingConfig.id }),
    });

    const container = render(page);

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('loads form with saved data filled in', async () => {
    const page = await EditMessagePlanPage({
      params: Promise.resolve({ routingConfigId: routingConfig.id }),
    });

    render(page);

    expect(await screen.findByTestId('name-field')).toHaveValue(
      routingConfig.name
    );

    expect(await screen.findByTestId('campaign-id-field')).toHaveValue(
      routingConfig.campaignId
    );
  });

  it('renders errors when form is submitted in invalid state', async () => {
    const user = await userEvent.setup();

    const page = await EditMessagePlanPage({
      params: Promise.resolve({ routingConfigId: routingConfig.id }),
    });

    const container = render(page);

    await user.clear(await screen.findByTestId('name-field'));

    await user.click(await screen.findByTestId('name-field'));

    await user.keyboard('x'.repeat(201));

    await user.selectOptions(
      await screen.findByTestId('campaign-id-field'),
      ''
    );

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

  it('updates the message plan and redirects to the choose templates page', async () => {
    const user = await userEvent.setup();

    const page = await EditMessagePlanPage({
      params: Promise.resolve({ routingConfigId: routingConfig.id }),
    });

    render(<NextRedirectBoundary>{page}</NextRedirectBoundary>);

    await user.clear(await screen.findByTestId('name-field'));

    await user.click(await screen.getByTestId('name-field'));

    await user.keyboard('New Name');

    await user.selectOptions(
      await screen.findByTestId('campaign-id-field'),
      alternateCampaignId
    );

    await user.click(await screen.findByTestId('submit-button'));

    expect(updateRoutingConfig).toHaveBeenCalledWith(routingConfig.id, {
      name: 'New Name',
      campaignId: alternateCampaignId,
    });

    expect(redirect).toHaveBeenCalledWith(
      `/message-plans/choose-templates/${routingConfig.id}`,
      RedirectType.push
    );
  });
});
