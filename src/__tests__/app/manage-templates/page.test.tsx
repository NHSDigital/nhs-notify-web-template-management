import ManageTemplatesPage from '@app/manage-templates/page';
import { render } from '@testing-library/react';

test('ManageTemplatesPage', async () => {
  const container = render(<ManageTemplatesPage />);

  expect(container.asFragment()).toMatchSnapshot();
});
