const { performCheck } = require('./helpers');
const {
  chooseATemplatePage,
  chooseATemplatePageError,
  createNHSAppTemplatePage,
  createNHSAppTemplateErrorPage,
  reviewNHSAppTemplatePage,
  reviewNHSAppTemplateErrorPage,
} = require('./actions');

function pa11yConfig() {
  const baseUrl = 'http://localhost:3000';

  const urls = [
    performCheck({ url: baseUrl, name: 'landing-page' }),
    performCheck(chooseATemplatePage(baseUrl)),
    performCheck(chooseATemplatePageError(baseUrl)),
    performCheck(createNHSAppTemplatePage(baseUrl)),
    performCheck(createNHSAppTemplateErrorPage(baseUrl)),
    performCheck(reviewNHSAppTemplatePage(baseUrl)),
    performCheck(reviewNHSAppTemplateErrorPage(baseUrl)),
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
      chromeLaunchOptions: {
        args: ['--no-sandbox']
      },
      standard: 'WCAG2AA',
      agent: 'pa11y',
      concurrency: 5
    }
  };
}

module.exports = pa11yConfig();

