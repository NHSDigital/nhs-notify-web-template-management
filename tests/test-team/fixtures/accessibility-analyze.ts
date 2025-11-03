import { test as base, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';
import { expect } from '@playwright/test';

type Analyze = <T extends TemplateMgmtBasePage>(
  page: T,
  opts?: {
    id?: string;
    beforeAnalyze?: (page: T) => Promise<void>;
  }
) => Promise<void>;

type AccessibilityFixture = {
  analyze: Analyze;
};

const makeAxeBuilder = (page: Page) =>
  new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']);

export const test = base.extend<AccessibilityFixture>({
  analyze: async ({ page }, use) => {
    const analyze: Analyze = async (pageUnderTest, opts) => {
      const { id, beforeAnalyze } = opts ?? {};

      await pageUnderTest.loadPage(id);

      if (beforeAnalyze) {
        await beforeAnalyze(pageUnderTest);
      }

      const results = await makeAxeBuilder(page).analyze();

      expect(results.violations).toEqual([]);
    };

    await use(analyze);
  },
});
