import ClientIdAndCampaignIdRequiredPage from '@app/create-letter-template/client-id-and-campaign-id-required/page';
import { render } from '@testing-library/react';

test('ClientIdAndCampaignIdRequiredPage', async () => {
  const container = render(<ClientIdAndCampaignIdRequiredPage />);

  expect(container.asFragment()).toMatchSnapshot();
});
