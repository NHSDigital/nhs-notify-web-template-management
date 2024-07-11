import { render } from '@testing-library/react';
import { NHSNotifyFormWrapper } from '../../components/molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';

test('Renders back button', () => {
  const container = render(
    <NHSNotifyFormWrapper formId='form-id' action='/action'>
      <input id='input' value='4' readOnly />
    </NHSNotifyFormWrapper>
  );

  expect(container.asFragment()).toMatchSnapshot();
});
