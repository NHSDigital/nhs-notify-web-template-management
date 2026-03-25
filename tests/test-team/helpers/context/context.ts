import path from 'node:path';
import { CognitoAuthHelper } from 'helpers/auth/cognito-auth-helper';
import { ClientConfigurationHelper } from 'helpers/client/client-helper';
import { TestContextFile } from './context-file';
import { LetterVariantStorageHelper } from 'helpers/db/letter-variant-storage-helper';

/**
 * Provides access to global test fixtures
 * This is for data which is not managed by the template management domain
 * And which is available across tests
 * e.g. Client Config, Users, Letter Variants
 */
class TestContext {
  private static contextFile = new TestContextFile(
    path.resolve(__dirname, '..', '..', '.context', 'test-context.json')
  );

  public readonly auth = new CognitoAuthHelper(TestContext.contextFile);

  public readonly clients = new ClientConfigurationHelper(
    TestContext.contextFile
  );

  public readonly letterVariants = new LetterVariantStorageHelper(
    TestContext.contextFile
  );

  async setup() {
    await this.clients.setup();

    await Promise.all([this.auth.setup(), this.letterVariants.setup()]);
  }

  async teardown() {
    await Promise.all([
      this.clients.teardown(),
      this.auth.teardown(),
      this.letterVariants.teardown(),
    ]);

    await TestContext.contextFile.destroyNamespace();
  }
}

export function getTestContext() {
  return new TestContext();
}
