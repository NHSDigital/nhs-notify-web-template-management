import { render, waitFor } from '@testing-library/react';
import {
  FeatureFlagProvider,
  useFeatureFlags,
} from '@providers/features-provider';

function TestConsumer() {
  const { featureFlags, loaded } = useFeatureFlags();
  return (
    <div>
      <p data-testid='loaded'> {loaded ? 'true' : 'false'}</p>
      <p data-testid='proofing'>{featureFlags.proofing ? 'true' : 'false'}</p>
      <p data-testid='routing'>{featureFlags.routing ? 'true' : 'false'}</p>
    </div>
  );
}

describe('FeatureFlagProvider', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when unauthenticated', () => {
    beforeEach(() => {
      jest.mock('@hooks/use-auth-status', () => ({
        useAuthStatus: () => 'unauthenticated',
      }));
    });

    it('should provide all feature flags as false when unauthenticated', async () => {
      const container = render(
        <FeatureFlagProvider>
          <TestConsumer />
        </FeatureFlagProvider>
      );

      await waitFor(() => {
        expect(container.getByTestId('loaded')).toHaveTextContent('false');
        expect(container.getByTestId('proofing')).toHaveTextContent('false');
        expect(container.getByTestId('routing')).toHaveTextContent('false');
      });
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      jest.mock('@hooks/use-auth-status', () => ({
        useAuthStatus: () => 'authenticated',
      }));
    });

    it('should provide feature flags when authenticated', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ proofing: true, routing: true }),
      });

      const container = render(
        <FeatureFlagProvider>
          <TestConsumer />
        </FeatureFlagProvider>
      );

      await waitFor(() => {
        expect(container.getByTestId('loaded')).toHaveTextContent('true');
        expect(container.getByTestId('proofing')).toHaveTextContent('true');
        expect(container.getByTestId('routing')).toHaveTextContent('true');
      });
    });
  });

  it('should fall back to default flags on fetch error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Failed'));

    const container = render(
      <FeatureFlagProvider>
        <TestConsumer />
      </FeatureFlagProvider>
    );

    await waitFor(() => {
      expect(container.getByTestId('loaded')).toHaveTextContent('true');
      expect(container.getByTestId('proofing')).toHaveTextContent('false');
      expect(container.getByTestId('routing')).toHaveTextContent('false');
    });
  });
});
