# NHS Notify Template Management (WebUI) Automated Regression Tests

This package includes tests for the template management UI. The tests can be run using the test:component script (among others) in the package.json.

This package includes:

- component tests, which are designed to test the behaviour on individual pages, and seed template data relevant to those pages at the start of the tests
- e2e tests, which simulate a user going through the whole app.

## Tips

### auth.setup.ts failing?

1. Ensure you've created a sandbox environment
2. Ensure your `frontend/amplify_outputs.json` is set correctly
3. Ensure `INCLUDE_AUTH_PAGES=true` is set when running in production mode

### Flakey-ish tests?

If the frontend application is running in `development` mode I.E. by doing `npm run dev`. Then the automated tests are slower and appear to be somewhat flakier.

It's best to run the tests in `production` mode by running a `npm run build && npm run start` or simply run e.g.

```bash
npm run test:component
```

Which will automatically `build` and `start` the frontend application.

### Need to see frontend application logs when testing?

Set `stdout` to `pipe` in [local.config.ts](config/local.config.ts).

### Need more debugging information?

Run the following;

```bash
npx playwright show-report <name of the downloaded folder>
```

You'll then be able to see the trace information on the failed tests.
