import { render } from '@testing-library/react';
import { Filename } from '@atoms/Filename/Filename';

describe('Filename component', () => {
  it('renders component correctly', () => {
    const container = render(<Filename filename='file.txt' />);

    expect(container.asFragment()).toMatchSnapshot();
  });
});
