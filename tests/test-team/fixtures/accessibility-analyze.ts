import { test as base, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';
import { expect } from '@playwright/test';

type Analyze = <T extends TemplateMgmtBasePage>(
  page: T,
  opts?: {
    beforeAnalyze?: (page: T) => Promise<void>;
  }
) => Promise<void>;

type AccessibilityFixture = {
  analyze: Analyze;
};

const DISABLED_RULES = [
  /* We don't have control over NHS colours.
   * Axe decides the page is 5.75 ratio and wcag2aaa expects 7:1
   */
  'color-contrast-enhanced',
];

const makeAxeBuilder = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa'])
    .disableRules(DISABLED_RULES);

export const test = base.extend<AccessibilityFixture>({
  analyze: async ({ page }, use) => {
    const analyze: Analyze = async (pageUnderTest, opts) => {
      const { beforeAnalyze } = opts ?? {};

      await pageUnderTest.loadPage();

      if (beforeAnalyze) {
        await beforeAnalyze(pageUnderTest);
      }

      await expect(page).toHaveURL(pageUnderTest.getUrl());

      const results = await makeAxeBuilder(page).analyze();

      expect(results.violations).toEqual([]);
    };

    await use(analyze);
  },
});
