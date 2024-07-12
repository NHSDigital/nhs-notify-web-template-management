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
  const baseUrl = process.env.BASE_URL ?? 'localhost:3000';
  const browser = await setupBrowser();
  const page = await setupPage(browser);

  const urls = [
    await performCheck(page, { url: baseUrl, name: 'landing-page' }),
    await performCheck(page, chooseATemplatePage(baseUrl)),
    await performCheck(page, chooseATemplatePageError(baseUrl)),
    await performCheck(page, createNHSAppTemplatePage(baseUrl)),
    await performCheck(page, createNHSAppTemplateErrorPage(baseUrl)),
    // await performCheck(browser, reviewNHSAppTemplatePage(baseUrl)),
    // await performCheck(browser, reviewNHSAppTemplateErrorPage(baseUrl)),
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
      concurrency: 5
    }
  };
}

module.exports = pa11yConfig();

