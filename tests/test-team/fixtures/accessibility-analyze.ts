import { test as base, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { TemplateMgmtBasePage } from 'pages/template-mgmt-base-page';
import { expect } from '@playwright/test';

type Analyze = <T extends TemplateMgmtBasePage>(
  page: T,
  opts?: {
    ids?: string[];
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
  analyze: async ({ baseURL, page }, use) => {
    const analyze: Analyze = async (pageUnderTest, opts) => {
      const { ids, beforeAnalyze } = opts ?? {};

      await pageUnderTest.loadPage(...(ids ?? []));

      if (beforeAnalyze) {
        await beforeAnalyze(pageUnderTest);
      }

      const pageUrlSegments = (
        pageUnderTest.constructor as typeof TemplateMgmtBasePage
      ).pageUrlSegments;

      await expect(page).toHaveURL(
        // eslint-disable-next-line security/detect-non-literal-regexp
        new RegExp(
          `${baseURL}/templates/${pageUrlSegments.join('/[^/]+/')}(.*)`
        )
      );

      const results = await makeAxeBuilder(page).analyze();

      expect(results.violations).toEqual([]);
    };

    await use(analyze);
  },
});
