import { render } from '@testing-library/react';
import CodeExample from '@atoms/CodeExample/CodeExample';

describe('CodeExample component', () => {
  it('renders component correctly', () => {
    const container = render(
      <CodeExample ariaId='test-id' ariaText='This is an example of markdown:'>
        # A test example
      </CodeExample>
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly when optional class is provided', () => {
    const container = render(
      <CodeExample
        ariaId='test-id'
        ariaText='This is an example of markdown:'
        codeClassName='test-class'
      >
        # A test example
      </CodeExample>
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
