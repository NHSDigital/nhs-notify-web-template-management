import { render, waitFor, screen } from '@testing-library/react';
import {
  FeatureFlagProvider,
  useFeatureFlags,
} from '@providers/features-provider';
import { Authenticator } from '@aws-amplify/ui-react';
import * as useAuthStatusHook from '@hooks/use-auth-status';

jest.mock('@hooks/use-auth-status');

global.fetch = jest.fn();

const mockUseAuthStatus = useAuthStatusHook.useAuthStatus as jest.Mock;

describe('FeatureFlagProvider', () => {
  const TestComponent = () => {
    const { featureFlags, loaded } = useFeatureFlags();

    return (
      <div>
        <p data-testid='loaded'> {loaded ? 'true' : 'false'}</p>
        <p data-testid='proofing'>{featureFlags.proofing ? 'true' : 'false'}</p>
        <p data-testid='routing'>{featureFlags.routing ? 'true' : 'false'}</p>
      </div>
    );
  };

  const renderWithProvider = () =>
    render(
      <Authenticator.Provider>
        <FeatureFlagProvider>
          <TestComponent />
        </FeatureFlagProvider>
      </Authenticator.Provider>
    );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when unauthenticated', () => {
    beforeEach(() => {
      mockUseAuthStatus.mockReturnValue('unauthenticated');
    });

    it('should provide all feature flags as false when unauthenticated', async () => {
      renderWithProvider();

      await waitFor(() => {
        expect(screen.getByTestId('loaded')).toHaveTextContent('false'); // loading should remain false
        expect(screen.getByTestId('proofing')).toHaveTextContent('false');
        expect(screen.getByTestId('routing')).toHaveTextContent('false');
      });
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      mockUseAuthStatus.mockReturnValue('authenticated');
    });

    it('should provide feature flags when authenticated', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ proofing: true, routing: true }),
      });

      renderWithProvider();

      await waitFor(() => {
        expect(screen.getByTestId('loaded')).toHaveTextContent('true');
        expect(screen.getByTestId('proofing')).toHaveTextContent('true');
        expect(screen.getByTestId('routing')).toHaveTextContent('true');
      });
    });

    it('should fall back to default flags on fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      renderWithProvider();

      await waitFor(() => {
        expect(screen.getByTestId('loaded')).toHaveTextContent('true');
        expect(screen.getByTestId('proofing')).toHaveTextContent('false');
        expect(screen.getByTestId('routing')).toHaveTextContent('false');
      });
    });
  });
});
