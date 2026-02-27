/* eslint-disable security/detect-non-literal-fs-filename */
import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';
import { Mutex } from 'async-mutex';
import type { LetterVariant } from 'nhs-notify-web-template-management-types';
import type { ClientConfiguration } from '../client/client-helper';
import type { TestUserContext } from '../auth/cognito-auth-helper';

type TestContextNamespace = {
  users: Record<string, TestUserContext>;
  clients: Record<string, ClientConfiguration>;
  letterVariants: Record<string, LetterVariant>;
};

export class TestContextFile {
  public readonly path: string;

  private mutex = new Mutex();

  constructor(filepath: string) {
    this.path = path.resolve(filepath);

    const dir = path.dirname(this.path);

    try {
      fs.accessSync(dir);
    } catch {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async setUser(id: string, value: Partial<TestUserContext>) {
    await this.mutex.runExclusive(() => {
      const data = this.read();
      const nsData = this.parseNamespace(data[process.env.PLAYWRIGHT_RUN_ID]);

      const keyData = nsData.users[id] || {};

      nsData.users[id] = { ...keyData, ...value };
      data[process.env.PLAYWRIGHT_RUN_ID] = nsData;

      this.write(data);
    });
  }

  async getUser(id: string): Promise<TestUserContext | null> {
    return this.mutex.runExclusive(
      () => this.read()[process.env.PLAYWRIGHT_RUN_ID]?.users?.[id] ?? null
    );
  }

  async getAllUsers(): Promise<TestUserContext[]> {
    return this.mutex.runExclusive(() =>
      Object.values(this.read()[process.env.PLAYWRIGHT_RUN_ID]?.users ?? {})
    );
  }

  async setClient(id: string, value: Partial<ClientConfiguration>) {
    await this.mutex.runExclusive(() => {
      const data = this.read();
      const nsData = this.parseNamespace(data[process.env.PLAYWRIGHT_RUN_ID]);

      const keyData = nsData.clients[id] || {};

      nsData.clients[id] = { ...keyData, ...value };
      data[process.env.PLAYWRIGHT_RUN_ID] = nsData;

      this.write(data);
    });
  }

  async getClient(id: string): Promise<ClientConfiguration | null> {
    return this.mutex.runExclusive(
      () => this.read()[process.env.PLAYWRIGHT_RUN_ID]?.clients?.[id] ?? null
    );
  }

  async getAllClientIds(): Promise<string[]> {
    return this.mutex.runExclusive(() =>
      Object.keys(this.read()[process.env.PLAYWRIGHT_RUN_ID]?.clients ?? {})
    );
  }

  async getAllClients(): Promise<[string, ClientConfiguration][]> {
    return this.mutex.runExclusive(() =>
      Object.entries(this.read()[process.env.PLAYWRIGHT_RUN_ID]?.clients ?? {})
    );
  }

  async setLetterVariant(id: string, value: LetterVariant) {
    await this.mutex.runExclusive(() => {
      const data = this.read();
      const nsData = this.parseNamespace(data[process.env.PLAYWRIGHT_RUN_ID]);

      const keyData = nsData.letterVariants[id] || {};

      nsData.letterVariants[id] = { ...keyData, ...value };
      data[process.env.PLAYWRIGHT_RUN_ID] = nsData;

      this.write(data);
    });
  }

  async setLetterVariants(values: Record<string, LetterVariant>) {
    await this.mutex.runExclusive(() => {
      const data = this.read();
      const nsData = this.parseNamespace(data[process.env.PLAYWRIGHT_RUN_ID]);

      nsData.letterVariants = { ...nsData.letterVariants, ...values };
      data[process.env.PLAYWRIGHT_RUN_ID] = nsData;

      this.write(data);
    });
  }

  async getLetterVariant(id: string): Promise<LetterVariant | null> {
    return this.mutex.runExclusive(
      () =>
        this.read()[process.env.PLAYWRIGHT_RUN_ID]?.letterVariants?.[id] ?? null
    );
  }

  async getAllLetterVariants(): Promise<LetterVariant[]> {
    return this.mutex.runExclusive(() => {
      return Object.values(
        this.read()[process.env.PLAYWRIGHT_RUN_ID]?.letterVariants ?? {}
      );
    });
  }

  async destroyNamespace(): Promise<void> {
    return this.mutex.runExclusive(() => {
      const data = this.read();
      Reflect.deleteProperty(data, process.env.PLAYWRIGHT_RUN_ID);
      this.write(data);
    });
  }

  private parseNamespace(
    namespace: TestContextNamespace | undefined
  ): TestContextNamespace {
    return {
      users: namespace?.users ?? {},
      clients: namespace?.clients ?? {},
      letterVariants: namespace?.letterVariants ?? {},
    };
  }

  private write(data: Record<string, TestContextNamespace>) {
    fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
  }

  private read() {
    const fd = fs.openSync(this.path, 'a+');
    const stat = fs.fstatSync(fd);
    const buff = Buffer.alloc(stat.size);

    try {
      fs.readSync(fd, buff);

      return JSON.parse(buff.toString('utf8') || '{}') as Record<
        string,
        TestContextNamespace
      >;
    } finally {
      fs.closeSync(fd);
    }
  }
}
