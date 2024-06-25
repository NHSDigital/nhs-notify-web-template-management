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
            timeout: 20000,
            wait: 2000,
            chromeLaunchConfig: {
            args: ['--no-sandbox']
        },
        useIncognitoBrowserContext: false,
        standard: 'WCAG2AA', //'WCAG2AAA'
        userAgent: 'pa11y-ci',
    },
    urls: ['localhost:3000']
};
