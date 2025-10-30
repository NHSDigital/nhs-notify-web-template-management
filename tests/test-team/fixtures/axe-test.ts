import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export type AxeFixture = {
  makeAxeBuilder: () => AxeBuilder;
};

/*
 * https://dequeuniversity.com/rules/axe/html/4.11 - search for wcag131
 */
const PRINCIPLE_1_GUIDELINE_1_1_3_1_AAA = [
  'aria-hidden-body',
  'aria-required-children',
  'aria-required-parent',
  'definition-list',
  'dlitem',
  'list',
  'listitem',
  'p-as-heading',
  'table-fake-caption',
  'td-has-header',
  'td-headers-attr',
  'th-has-data-cells',
];

export const test = base.extend<AxeFixture>({
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () =>
      new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']); // This list is inclusive

    await use(makeAxeBuilder);
  },
});
export { expect } from '@playwright/test';
