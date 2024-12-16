function performCheck(options) {
  const defaultOptions = {
    ...options,
  };

  if (!defaultOptions.name) {
    throw new Error('options.name is required');
  }

  if (!defaultOptions.url) {
    throw new Error('options.url is required');
  }

  console.log('running');

  return {
    ...defaultOptions,
    url: `${defaultOptions.url}`,
    screenCapture: `./.reports/accessibility/${defaultOptions.name}.png`,
  };
}

module.exports = {
  performCheck,
};
