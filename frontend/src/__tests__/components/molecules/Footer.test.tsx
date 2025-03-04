import { render, screen } from '@testing-library/react';
import { NHSNotifyFooter } from '@molecules/Footer/Footer';
import content from '@content/content';

const footerContent = content.components.footer;

describe('Footer component', () => {
  it('renders component correctly', () => {
    render(<NHSNotifyFooter />);

    expect(screen.getByTestId('page-footer')).toBeInTheDocument();
    expect(screen.getByTestId('support-links')).toBeInTheDocument();

    expect(
      screen.getByTestId('accessibility-statement-link')
    ).toBeInTheDocument();
    expect(screen.getByTestId('accessibility-statement-link')).toHaveAttribute(
      'href',
      `${footerContent.links.accessibilityStatement.url}`
    );

    expect(screen.getByTestId('contact-us-link')).toBeInTheDocument();
    expect(screen.getByTestId('contact-us-link')).toHaveAttribute('href', '#');

    expect(screen.getByTestId('cookies-link')).toBeInTheDocument();
    expect(screen.getByTestId('cookies-link')).toHaveAttribute('href', '#');

    expect(screen.getByTestId('privacy-policy-link')).toBeInTheDocument();
    expect(screen.getByTestId('privacy-policy-link')).toHaveAttribute(
      'href',
      '#'
    );

    expect(screen.getByTestId('terms-and-conditions-link')).toBeInTheDocument();
    expect(screen.getByTestId('terms-and-conditions-link')).toHaveAttribute(
      'href',
      '#'
    );
    expect(
      screen.getByTestId('nhs-england-copyright-text')
    ).toBeInTheDocument();
  });
});
