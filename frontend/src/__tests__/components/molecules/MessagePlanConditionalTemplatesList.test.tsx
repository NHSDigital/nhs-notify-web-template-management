import { render } from '@testing-library/react';
import {
  MessagePlanConditionalTemplatesList,
  MessagePlanConditionalTemplatesListItem,
} from '@molecules/MessagePlanConditionalTemplatesList/MessagePlanConditionalTemplatesList';

describe('MessagePlanConditionalTemplatesList', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(
      <MessagePlanConditionalTemplatesList
        className='extra-list-class'
        data-testid='conditional-templates-list'
      >
        <MessagePlanConditionalTemplatesListItem
          className='extra-list-item-class'
          data-testid='conditional-templates-list-item-1'
        >
          Second List Item Content
        </MessagePlanConditionalTemplatesListItem>
        <MessagePlanConditionalTemplatesListItem
          className='extra-list-item-class'
          data-testid='conditional-templates-list-item-2'
        >
          First List Item Content
        </MessagePlanConditionalTemplatesListItem>
      </MessagePlanConditionalTemplatesList>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
