import InvalidMessagePlanPage from '@app/message-plans/invalid/page';
import { render } from '@testing-library/react';

test('InvalidMessagePlanPage', async () => {
  const container = render(<InvalidMessagePlanPage />);

  expect(container.asFragment()).toMatchSnapshot();
});
