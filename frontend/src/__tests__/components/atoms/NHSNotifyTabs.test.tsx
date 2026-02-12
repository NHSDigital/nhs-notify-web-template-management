import { render, screen, fireEvent } from '@testing-library/react';
import {
  NHSNotifyTabs,
  type TabItem,
} from '@atoms/NHSNotifyTabs/NHSNotifyTabs';

const mockTabs: TabItem[] = [
  { id: 'tab-one', label: 'Tab One', content: <div>Content One</div> },
  { id: 'tab-two', label: 'Tab Two', content: <div>Content Two</div> },
  { id: 'tab-three', label: 'Tab Three', content: <div>Content Three</div> },
];

describe('NHSNotifyTabs', () => {
  it('renders all tabs', () => {
    render(<NHSNotifyTabs title='Test Tabs' tabs={mockTabs} />);

    expect(screen.getByRole('tab', { name: 'Tab One' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab Three' })).toBeInTheDocument();
  });

  it('renders the title', () => {
    render(<NHSNotifyTabs title='Test Tabs' tabs={mockTabs} />);

    expect(screen.getByText('Test Tabs')).toBeInTheDocument();
  });

  it('selects the first tab by default', () => {
    render(<NHSNotifyTabs title='Test Tabs' tabs={mockTabs} />);

    const firstTab = screen.getByRole('tab', { name: 'Tab One' });
    const secondTab = screen.getByRole('tab', { name: 'Tab Two' });

    expect(firstTab).toHaveAttribute('aria-selected', 'true');
    expect(secondTab).toHaveAttribute('aria-selected', 'false');
  });

  it('uses defaultTab when provided', () => {
    render(
      <NHSNotifyTabs title='Test Tabs' tabs={mockTabs} defaultTab='tab-two' />
    );

    const firstTab = screen.getByRole('tab', { name: 'Tab One' });
    const secondTab = screen.getByRole('tab', { name: 'Tab Two' });

    expect(firstTab).toHaveAttribute('aria-selected', 'false');
    expect(secondTab).toHaveAttribute('aria-selected', 'true');
  });

  it('switches tabs on click', () => {
    render(<NHSNotifyTabs title='Test Tabs' tabs={mockTabs} />);

    const secondTab = screen.getByRole('tab', { name: 'Tab Two' });
    fireEvent.click(secondTab);

    expect(secondTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('shows active panel and hides inactive panels', () => {
    render(<NHSNotifyTabs title='Test Tabs' tabs={mockTabs} />);

    const panelOne = screen.getByRole('tabpanel', { name: 'Tab One' });
    const panelTwo = screen.getByRole('tabpanel', { name: 'Tab Two' });

    expect(panelOne).not.toHaveClass('nhsuk-tabs__panel--hidden');
    expect(panelTwo).toHaveClass('nhsuk-tabs__panel--hidden');

    fireEvent.click(screen.getByRole('tab', { name: 'Tab Two' }));

    expect(panelOne).toHaveClass('nhsuk-tabs__panel--hidden');
    expect(panelTwo).not.toHaveClass('nhsuk-tabs__panel--hidden');
  });

  it('applies selected class to active tab list item (tab title)', () => {
    render(<NHSNotifyTabs title='Test Tabs' tabs={mockTabs} />);

    const firstTabLink = screen.getByRole('tab', { name: 'Tab One' });
    const secondTabLink = screen.getByRole('tab', { name: 'Tab Two' });

    expect(firstTabLink.closest('li')).toHaveClass(
      'nhsuk-tabs__list-item--selected'
    );
    expect(secondTabLink.closest('li')).not.toHaveClass(
      'nhsuk-tabs__list-item--selected'
    );

    fireEvent.click(secondTabLink);

    expect(firstTabLink.closest('li')).not.toHaveClass(
      'nhsuk-tabs__list-item--selected'
    );
    expect(secondTabLink.closest('li')).toHaveClass(
      'nhsuk-tabs__list-item--selected'
    );
  });

  it('sets correct tabindex on tabs', () => {
    render(<NHSNotifyTabs title='Test Tabs' tabs={mockTabs} />);

    const firstTab = screen.getByRole('tab', { name: 'Tab One' });
    const secondTab = screen.getByRole('tab', { name: 'Tab Two' });

    expect(firstTab).toHaveAttribute('tabindex', '0');
    expect(secondTab).toHaveAttribute('tabindex', '-1');
  });

  it('applies custom className', () => {
    const { container } = render(
      <NHSNotifyTabs
        title='Test Tabs'
        tabs={mockTabs}
        className='custom-class'
      />
    );

    const tabsContainer = container.querySelector('.nhsuk-tabs');
    expect(tabsContainer).toHaveClass('custom-class');
  });

  it('renders tab content correctly', () => {
    render(<NHSNotifyTabs title='Test Tabs' tabs={mockTabs} />);

    expect(screen.getByText('Content One')).toBeInTheDocument();
    expect(screen.getByText('Content Two')).toBeInTheDocument();
    expect(screen.getByText('Content Three')).toBeInTheDocument();
  });

  it('has correct aria-controls and aria-labelledby relationships', () => {
    render(<NHSNotifyTabs title='Test Tabs' tabs={mockTabs} />);

    const firstTab = screen.getByRole('tab', { name: 'Tab One' });
    const firstPanel = screen.getByRole('tabpanel', { name: 'Tab One' });

    expect(firstTab).toHaveAttribute('aria-controls', 'tab-one');
    expect(firstTab).toHaveAttribute('id', 'tab-tab-one');
    expect(firstPanel).toHaveAttribute('id', 'tab-one');
    expect(firstPanel).toHaveAttribute('aria-labelledby', 'tab-tab-one');
  });

  it('matches snapshot', () => {
    const { asFragment } = render(
      <NHSNotifyTabs title='Test Tabs' tabs={mockTabs} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
