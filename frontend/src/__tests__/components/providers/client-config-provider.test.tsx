import { render, screen } from '@testing-library/react';
import {
  ClientConfigProvider,
  useClientConfig,
} from '@providers/client-config-provider';

const TestComponent = () => {
  const config = useClientConfig();
  return (
    <div>
      <p data-testid='proofing'>
        {config.features.proofing ? 'true' : 'false'}
      </p>
      <p data-testid='routing'>{config.features.routing ? 'true' : 'false'}</p>
      <p data-testid='campaign-id'>{config.campaignId}</p>
      <p data-testid='campaign-ids'>{JSON.stringify(config.campaignIds)}</p>
    </div>
  );
};

it('renders provided feature flags', () => {
  render(
    <ClientConfigProvider
      config={{
        campaignId: 'campaign-0',
        campaignIds: ['campaign-1', 'campaign-2'],
        features: { proofing: true, routing: false },
      }}
    >
      <TestComponent />
    </ClientConfigProvider>
  );
  expect(screen.getByTestId('proofing')).toHaveTextContent('true');
  expect(screen.getByTestId('routing')).toHaveTextContent('false');
  expect(screen.getByTestId('campaign-id')).toHaveTextContent('campaign-0');
  expect(screen.getByTestId('campaign-ids')).toHaveTextContent(
    '["campaign-1","campaign-2"]'
  );
});
