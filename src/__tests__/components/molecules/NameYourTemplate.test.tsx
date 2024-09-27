import { render } from '@testing-library/react';
import { NameYourTemplate } from '@molecules/NameYourTemplate';

describe('NameYourTemplate component', () => {
  it('renders component correctly as NameYourTemplate', () => {
    const container = render(<NameYourTemplate />);

    expect(container.asFragment()).toMatchSnapshot();
  });
});
