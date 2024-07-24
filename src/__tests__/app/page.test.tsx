import { render, screen } from '@testing-library/react';
import HomePage from '@/src/app/page';
import content from '@/src/content/content';

const homePageContent = content.pages.homePage;

describe('Header component', () => {
  it('renders component correctly', () => {
    render(<HomePage />);

    expect(screen.getByTestId('page-content-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('page-heading')).toBeInTheDocument();
    expect(screen.getByTestId('page-sub-heading')).toBeInTheDocument();
    expect(screen.getByTestId('link-button')).toBeInTheDocument();
    expect(screen.getByTestId('link-button')).toHaveAttribute(
      'href',
      homePageContent.linkButton.url
    );
    expect(screen.getByTestId('link-button')).toHaveTextContent(
      homePageContent.linkButton.text
    );
  });
});
