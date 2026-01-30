import { render } from '@testing-library/react';
import { MessagePlanBlock } from '@molecules/MessagePlanBlock/MessagePlanBlock';
import { ORDINALS } from 'nhs-notify-web-template-management-utils';

const cases = ORDINALS.map((ordinal, index) => ({ ordinal, index }));

describe('MessagePlanBlock', () => {
  it.each(cases)(
    'matches snapshot - index $index renders "$ordinal"',
    ({ index, ordinal }) => {
      const { asFragment } = render(
        <MessagePlanBlock
          index={index}
          className='extra-message-plan-block-class'
          data-testid={`message-plan-block-${ordinal}`}
        />
      );

      expect(asFragment()).toMatchSnapshot();
    }
  );
});
