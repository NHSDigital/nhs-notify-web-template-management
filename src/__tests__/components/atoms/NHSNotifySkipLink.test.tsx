import { render } from '@testing-library/react';
import { NHSNotifySkipLink } from '@atoms/NHSNotifySkipLink/NHSNotifySkipLink';
import userEvent from '@testing-library/user-event';

test('puts focus on h1', async () => {
  const user = userEvent.setup();
  const container = render(
    <>
      <NHSNotifySkipLink />
      <h1 id='heading'>heading</h1>
      <p id='not-maincontent'>other</p>
    </>
  );

  expect(container.asFragment()).toMatchSnapshot();

  const skipButton = document.querySelector('#skip-link');
  if (!skipButton) {
    throw new Error('Skip button not found');
  }

  await user.click(skipButton);

  const headingElement = document.querySelector('#heading');
  if (!headingElement) {
    throw new Error('heading element not found');
  }

  expect(headingElement).toHaveFocus();

  const otherElement = document.querySelector('#not-maincontent');
  if (!otherElement) {
    throw new Error('not-maincontent element not found');
  }

  await user.click(otherElement);
  expect(headingElement).not.toHaveFocus();
});

test('puts focus on main content when there is no h1', async () => {
  const user = userEvent.setup();
  const container = render(
    <>
      <NHSNotifySkipLink />
      <p id='maincontent'>heading</p>
    </>
  );

  expect(container.asFragment()).toMatchSnapshot();

  const skipButton = document.querySelector('#skip-link');

  if (!skipButton) {
    throw new Error('Skip button not found');
  }

  await user.click(skipButton);

  expect(document.querySelector('#maincontent')).toHaveFocus();
});

test('does nothing when there is no h1 or #maincontent', async () => {
  const user = userEvent.setup();
  const container = render(
    <>
      <NHSNotifySkipLink />
      <p id='not-maincontent'>heading</p>
    </>
  );

  expect(container.asFragment()).toMatchSnapshot();

  const skipButton = document.querySelector('#skip-link');

  if (!skipButton) {
    throw new Error('Skip button not found');
  }

  await user.click(skipButton);

  expect(skipButton).toHaveFocus();
});
