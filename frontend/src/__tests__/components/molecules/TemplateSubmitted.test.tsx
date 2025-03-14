import { TemplateSubmitted } from '@molecules/TemplateSubmitted/TemplateSubmitted';
import { render } from '@testing-library/react';

describe('TemplateSubmitted component', () => {
  it('should render', () => {
    const container = render(
      <TemplateSubmitted
        templateId='template-id'
        templateName='template-name'
        templateType='SMS'
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
