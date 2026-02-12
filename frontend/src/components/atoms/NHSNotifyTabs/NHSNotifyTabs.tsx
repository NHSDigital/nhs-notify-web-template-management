'use client';

import { useState, ReactNode } from 'react';
import classNames from 'classnames';

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

type NHSNotifyTabsProps = {
  title: string;
  tabs: TabItem[];
  className?: string;
  defaultTab?: string;
};

export function NHSNotifyTabs({
  title,
  tabs,
  className,
  defaultTab,
}: NHSNotifyTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id);

  const handleTabClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    tabId: string
  ) => {
    event.preventDefault();
    setActiveTab(tabId);
  };

  return (
    <div className={classNames('nhsuk-tabs', className)}>
      <h2 className='nhsuk-tabs__title'>{title}</h2>
      <ul className='nhsuk-tabs__list' role='tablist'>
        {tabs.map((tab) => (
          <li
            key={tab.id}
            className={classNames('nhsuk-tabs__list-item', {
              'nhsuk-tabs__list-item--selected': activeTab === tab.id,
            })}
            role='presentation'
          >
            <a
              className='nhsuk-tabs__tab'
              href={`#${tab.id}`}
              id={`tab-${tab.id}`}
              role='tab'
              aria-controls={tab.id}
              aria-selected={activeTab === tab.id}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={(e) => handleTabClick(e, tab.id)}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={classNames('nhsuk-tabs__panel', {
            'nhsuk-tabs__panel--hidden': activeTab !== tab.id,
          })}
          id={tab.id}
          role='tabpanel'
          aria-labelledby={`tab-${tab.id}`}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
