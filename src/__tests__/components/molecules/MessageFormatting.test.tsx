import { render, screen } from '@testing-library/react';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';
import { TemplateType } from '@utils/types';

const componentProps = {
  template: TemplateType.SMS,
};

describe('MessageFormatting component', () => {
  it('renders component correctly with SMS related formatting', () => {
    render(<MessageFormatting {...componentProps} />);

    expect(screen.getByTestId('personalisation-header')).toHaveTextContent(
      'Message formatting'
    );
    expect(screen.getByTestId('link-and-url-details')).toBeInTheDocument();
  });

  it('renders component correctly with APP related formatting', () => {
    const appFormattingProps = {
      ...componentProps,
      template: TemplateType.NHS_APP,
    };
    render(<MessageFormatting {...appFormattingProps} />);

    expect(screen.getByTestId('personalisation-header')).toHaveTextContent(
      'Message formatting'
    );
    expect(
      screen.getByTestId('lines-breaks-and-paragraphs-details')
    ).toBeInTheDocument();
    expect(screen.getByTestId('headings-details')).toBeInTheDocument();
    expect(screen.getByTestId('bold-text-details')).toBeInTheDocument();
    expect(screen.getByTestId('link-and-url-details')).toBeInTheDocument();
  });

  it('renders component correctly with EMAIL related formatting', () => {
    const emailFormattingProps = {
      ...componentProps,
      template: TemplateType.EMAIL,
    };
    render(<MessageFormatting {...emailFormattingProps} />);

    expect(screen.getByTestId('personalisation-header')).toHaveTextContent(
      'Message formatting'
    );
    expect(
      screen.getByTestId('lines-breaks-and-paragraphs-details')
    ).toBeInTheDocument();
    expect(screen.getByTestId('headings-details')).toBeInTheDocument();
    expect(screen.getByTestId('bullet-lists-details')).toBeInTheDocument();
    expect(screen.getByTestId('numbered-list-details')).toBeInTheDocument();
    expect(screen.getByTestId('horizontal-lines-details')).toBeInTheDocument();
    expect(screen.getByTestId('link-and-url-details')).toBeInTheDocument();
  });

  it('renders component correctly with LETTER related formatting', () => {
    const letterFormattingProps = {
      ...componentProps,
      template: TemplateType.LETTER,
    };
    render(<MessageFormatting {...letterFormattingProps} />);

    expect(screen.getByTestId('personalisation-header')).toHaveTextContent(
      'Body text formatting'
    );
    expect(
      screen.getByTestId('lines-breaks-and-paragraphs-details')
    ).toBeInTheDocument();
    expect(screen.getByTestId('headings-details')).toBeInTheDocument();
    expect(screen.getByTestId('bold-text-details')).toBeInTheDocument();
    expect(screen.getByTestId('bullet-lists-details')).toBeInTheDocument();
    expect(screen.getByTestId('numbered-list-details')).toBeInTheDocument();
    expect(screen.getByTestId('signatures-details')).toBeInTheDocument();
    expect(screen.getByTestId('page-breaks-details')).toBeInTheDocument();
    expect(screen.getByTestId('content-blocks-details')).toBeInTheDocument();
  });
});
