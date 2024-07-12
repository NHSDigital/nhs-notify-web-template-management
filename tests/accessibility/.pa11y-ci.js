const { performCheck, setupBrowser, setupPage } = require('./helpers');
const {
  chooseATemplatePage,
  chooseATemplatePageError,
  createNHSAppTemplatePage,
  createNHSAppTemplateErrorPage,
  reviewNHSAppTemplatePage,
  reviewNHSAppTemplateErrorPage,
} = require('./actions');

async function pa11yConfig() {
  const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
  const browser = await setupBrowser();
  const page = await setupPage(
    browser,
    process.env.BASIC_AUTH_USERNAME,
    process.env.BASIC_AUTH_PASSWORD
  );

  const urls = [
    performCheck(page, { url: baseUrl, name: 'landing-page' }),
    performCheck(page, chooseATemplatePage(baseUrl)),
    performCheck(page, chooseATemplatePageError(baseUrl)),
    performCheck(page, createNHSAppTemplatePage(baseUrl)),
    performCheck(page, createNHSAppTemplateErrorPage(baseUrl)),
    performCheck(page, reviewNHSAppTemplatePage(baseUrl)),
    performCheck(page, reviewNHSAppTemplateErrorPage(baseUrl)),
  ];

  return {
    urls,
    defaults: {
      reporters: [
        'cli',
        [
          'pa11y-ci-reporter-html',
          {
            destination: './.reports/accessibility',
            includeZeroIssues: true
          }
        ],
      ],
      rules: [
        'Principle1.Guideline1_3.1_3_1_AAA',
      ],
      standard: 'WCAG2AA',
      agent: 'pa11y',
      concurrency: Object.freeze(1) // do not update this. Higher concurrency breaks the overridden puppeteer
    }
  };
}

module.exports = pa11yConfig();

