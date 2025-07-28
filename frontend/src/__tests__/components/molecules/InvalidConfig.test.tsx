import InvalidConfig from '@molecules/InvalidConfig/InvalidConfig';
import { render } from '@testing-library/react';

test('InvalidConfig', async () => {
  const container = render(<InvalidConfig />);

  expect(container.asFragment()).toMatchSnapshot();
});
