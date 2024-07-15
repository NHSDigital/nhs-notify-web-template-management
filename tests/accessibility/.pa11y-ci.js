const { goToCreateNhsAppTemplatePage } = require('./actions/create-nhs-app-template.action');

module.exports = {
  defaults: {
    reporters: [
      'cli', // <-- this is the default reporter
      [
        'pa11y-ci-reporter-html',
        {
          destination: './.reports/accessibility',
          includeZeroIssues: true
        }
      ],
    ],
    chromeLaunchConfig: {
      args: ['--no-sandbox']
    },
    useIncognitoBrowserContext: false,
    standard: 'WCAG2AA', //'WCAG2AAA'
    userAgent: 'pa11y-ci',
  },
  urls: ['localhost:3000/some-404', 'localhost:3000/templates', 'localhost:3000/templates/create-template', goToCreateNhsAppTemplatePage('localhost:3000/templates/create-template')]
};
