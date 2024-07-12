const puppeteer = require('puppeteer');

async function setupBrowser() {
  return puppeteer.launch({
    args: ['--no-sandbox'],
    headless: true,
    timeout: 30_000,
    wait: 500,
  });
}

async function setupPage(browser, username, password) {
  const page = await browser.newPage();

  if (username && password) {
    await page.authenticate({ username, password });
  }

  return page;
}

function performCheck(page, options) {
  const defaultOptions = {
    ...options,
  };

  if (!defaultOptions.name) {
    throw new Error('options.name is required');
  }

  if (!defaultOptions.url) {
    throw new Error('options.url is required');
  }

  return {
    ...defaultOptions,
    page,
    url: `${defaultOptions.url}?pageName=${defaultOptions.name}`,
    screenCapture: `./.reports/accessibility/${defaultOptions.name}.png`,
  };
}

module.exports = {
  setupBrowser,
  setupPage,
  performCheck,
};
