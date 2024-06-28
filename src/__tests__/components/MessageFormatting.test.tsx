import { render, screen } from '@testing-library/react';
import { MessageFormatting } from '@/src/components/molecules/MessageFormatting/MessageFormatting';
import { MessageFormattingType } from '@/src/components/molecules/MessageFormatting/message-formatting.types';
import { TemplateFormatText } from '@/src/types/template-format.types';

const componentProps: MessageFormattingType = {
  template: TemplateFormatText.SMS,
};

describe('MessageFormatting component', () => {
  it('renders component correctly with SMS related formatting', async () => {
    render(<MessageFormatting {...componentProps} />);

    expect(screen.getByTestId('link-and-url-details')).toBeInTheDocument();
    expect(
      screen.getByTestId('lines-breaks-and-paragraphs-details')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('bold-text-details')).not.toBeInTheDocument();
    expect(screen.queryByTestId('headings-details')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('bullet-lists-details')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('numbered-list-details')
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('signatures-details')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('horizontal-lines-details')
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('page-breaks-details')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('content-blocks-details')
    ).not.toBeInTheDocument();
  });

  it('renders component correctly with APP related formatting', async () => {
    const appFormattingProps: MessageFormattingType = {
      ...componentProps,
      template: TemplateFormatText.APP,
    };
    render(<MessageFormatting {...appFormattingProps} />);

    expect(screen.getByTestId('link-and-url-details')).toBeInTheDocument();
    expect(screen.getByTestId('bold-text-details')).toBeInTheDocument();
    expect(
      screen.getByTestId('lines-breaks-and-paragraphs-details')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('headings-details')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('bullet-lists-details')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('numbered-list-details')
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('signatures-details')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('horizontal-lines-details')
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('page-breaks-details')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('content-blocks-details')
    ).not.toBeInTheDocument();
  });

  it('renders component correctly with EMAIL related formatting', async () => {
    const emailFormattingProps: MessageFormattingType = {
      ...componentProps,
      template: TemplateFormatText.EMAIL,
    };
    render(<MessageFormatting {...emailFormattingProps} />);

    expect(screen.getByTestId('link-and-url-details')).toBeInTheDocument();
    expect(screen.getByTestId('bold-text-details')).toBeInTheDocument();
    expect(
      screen.getByTestId('lines-breaks-and-paragraphs-details')
    ).toBeInTheDocument();
    expect(screen.getByTestId('headings-details')).toBeInTheDocument();
    expect(screen.getByTestId('bullet-lists-details')).toBeInTheDocument();
    expect(screen.getByTestId('numbered-list-details')).toBeInTheDocument();
    expect(screen.getByTestId('signatures-details')).toBeInTheDocument();
    expect(screen.getByTestId('horizontal-lines-details')).toBeInTheDocument();
    expect(screen.queryByTestId('page-breaks-details')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('content-blocks-details')
    ).not.toBeInTheDocument();
  });

  it('renders component correctly with LETTER related formatting', async () => {
    const letterFormattingProps: MessageFormattingType = {
      ...componentProps,
      template: TemplateFormatText.LETTER,
    };
    render(<MessageFormatting {...letterFormattingProps} />);

    expect(screen.getByTestId('link-and-url-details')).toBeInTheDocument();
    expect(screen.getByTestId('bold-text-details')).toBeInTheDocument();
    expect(
      screen.getByTestId('lines-breaks-and-paragraphs-details')
    ).toBeInTheDocument();
    expect(screen.getByTestId('headings-details')).toBeInTheDocument();
    expect(screen.getByTestId('bullet-lists-details')).toBeInTheDocument();
    expect(screen.getByTestId('numbered-list-details')).toBeInTheDocument();
    expect(screen.getByTestId('signatures-details')).toBeInTheDocument();
    expect(screen.getByTestId('horizontal-lines-details')).toBeInTheDocument();
    expect(screen.getByTestId('page-breaks-details')).toBeInTheDocument();
    expect(screen.getByTestId('content-blocks-details')).toBeInTheDocument();
  });
});
