import { ActionLink } from '@molecules/PreviewTemplateDetails/ActionLink';
import { render, screen } from '@testing-library/react';

describe('ActionLink', () => {
  it('renders link with label and visually hidden text', () => {
    render(
      <ActionLink
        href='/edit/123'
        label='Edit'
        visuallyHiddenText='template name'
        testId='test-link'
      />
    );

    const link = screen.getByTestId('test-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/edit/123');
    expect(link).toHaveTextContent('Edit');
    expect(link).toHaveTextContent('template name');
  });

  it('renders aria-hidden SummaryList.Actions when hidden is true', () => {
    const { container } = render(
      <ActionLink
        href='/edit/123'
        label='Edit'
        visuallyHiddenText='template name'
        testId='test-link'
        hidden
      />
    );

    expect(screen.queryByTestId('test-link')).not.toBeInTheDocument();
    const actions = container.querySelector('.nhsuk-summary-list__actions');
    expect(actions).toBeInTheDocument();
    expect(actions).toHaveAttribute('aria-hidden', 'true');
  });

  it('adds external link attributes when external is true', () => {
    render(
      <ActionLink
        href='https://example.com'
        label='Learn more'
        visuallyHiddenText='about templates'
        testId='external-link'
        external
      />
    );

    const link = screen.getByTestId('external-link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not add external link attributes when external is false', () => {
    render(
      <ActionLink
        href='/internal'
        label='Edit'
        visuallyHiddenText='template'
        testId='internal-link'
      />
    );

    const link = screen.getByTestId('internal-link');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });
});
