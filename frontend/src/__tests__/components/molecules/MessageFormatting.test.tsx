import { render, screen } from '@testing-library/react';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';
import { TemplateType } from 'nhs-notify-web-template-management-types';

describe('MessageFormatting component', () => {
  it('renders component correctly with SMS related formatting', () => {
    render(<MessageFormatting templateType='SMS' />);

    expect(screen.getByTestId('message-formatting-header')).toHaveTextContent(
      'Message formatting'
    );
    expect(screen.getByTestId('links-and-urls-details')).toBeInTheDocument();
  });

  it('renders component correctly with APP related formatting', () => {
    render(<MessageFormatting templateType='NHS_APP' />);

    expect(screen.getByTestId('message-formatting-header')).toHaveTextContent(
      'Message formatting'
    );
    expect(
      screen.getByTestId('line-breaks-and-paragraphs-details')
    ).toBeInTheDocument();
    expect(screen.getByTestId('headings-details')).toBeInTheDocument();
    expect(screen.getByTestId('bold-text-details')).toBeInTheDocument();
    expect(screen.getByTestId('links-and-urls-details')).toBeInTheDocument();
  });

  it('renders component correctly with EMAIL related formatting', () => {
    render(<MessageFormatting templateType='EMAIL' />);

    expect(screen.getByTestId('message-formatting-header')).toHaveTextContent(
      'Message formatting'
    );
    expect(
      screen.getByTestId('line-breaks-and-paragraphs-details')
    ).toBeInTheDocument();
    expect(screen.getByTestId('headings-details')).toBeInTheDocument();
    expect(screen.getByTestId('bullet-points-details')).toBeInTheDocument();
    expect(screen.getByTestId('numbered-lists-details')).toBeInTheDocument();
    expect(screen.getByTestId('horizontal-lines-details')).toBeInTheDocument();
    expect(screen.getByTestId('links-and-urls-details')).toBeInTheDocument();
  });

  it.each(['NHS_APP', 'EMAIL', 'SMS', 'LETTER'] as TemplateType[])(
    'matches snapshot for %s',
    (templateType) => {
      const { container } = render(
        <MessageFormatting templateType={templateType} />
      );
      expect(container).toMatchSnapshot();
    }
  );
});
