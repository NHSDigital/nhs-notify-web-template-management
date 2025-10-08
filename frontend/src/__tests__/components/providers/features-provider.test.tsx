import { render, screen } from '@testing-library/react';
import {
  FeatureFlagProvider,
  useFeatureFlags,
} from '@providers/features-provider';

const TestComponent = () => {
  const featureFlags = useFeatureFlags();
  return (
    <div>
      <p data-testid='proofing'>{featureFlags.proofing ? 'true' : 'false'}</p>
      <p data-testid='routing'>{featureFlags.routing ? 'true' : 'false'}</p>
    </div>
  );
};

it('renders provided feature flags', () => {
  render(
    <FeatureFlagProvider featureFlags={{ proofing: true, routing: false }}>
      <TestComponent />
    </FeatureFlagProvider>
  );
  expect(screen.getByTestId('proofing')).toHaveTextContent('true');
  expect(screen.getByTestId('routing')).toHaveTextContent('false');
});
