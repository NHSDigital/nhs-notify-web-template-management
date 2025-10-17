import InvalidConfig from '@molecules/InvalidConfig/InvalidConfig';
import { render } from '@testing-library/react';

const content = {
  heading: 'Example Heading',
  text: 'Example Text',
  insetText: 'Example Inset Text',
  backLinkText: 'Example Back Link Text',
  backLinkUrl: '/example-back-link-url',
};

test('InvalidConfig', async () => {
  const container = render(<InvalidConfig {...content} />);

  expect(container.asFragment()).toMatchSnapshot();
});
