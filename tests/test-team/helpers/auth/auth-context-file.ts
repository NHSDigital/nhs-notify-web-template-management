/* eslint-disable security/detect-non-literal-fs-filename */
import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';
import { Mutex } from 'async-mutex';
import type { ClientConfiguration } from '../client/client-helper';
import type { TestUserContext } from './cognito-auth-helper';

type AuthContextNamespace = {
  users: Record<string, TestUserContext>;
  clients: Record<string, ClientConfiguration>;
};

export class AuthContextFile {
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

  async setUser(
    namespace: string,
    id: string,
    value: Partial<TestUserContext>
  ) {
    await this.mutex.runExclusive(() => {
      const data = this.read();
      const nsData = this.parseNamespace(data[namespace]);

      const keyData = nsData.users[id] || {};

      nsData.users[id] = { ...keyData, ...value };
      data[namespace] = nsData;

      this.write(data);
    });
  }

  async getUser(
    namespace: string,
    id: string
  ): Promise<TestUserContext | null> {
    return this.mutex.runExclusive(
      () => this.read()[namespace]?.users?.[id] ?? null
    );
  }

  async userValues(namespace: string): Promise<TestUserContext[]> {
    return this.mutex.runExclusive(() =>
      Object.values(this.read()[namespace]?.users ?? {})
    );
  }

  async setClient(
    namespace: string,
    id: string,
    value: Partial<ClientConfiguration>
  ) {
    await this.mutex.runExclusive(() => {
      const data = this.read();
      const nsData = this.parseNamespace(data[namespace]);

      const keyData = nsData.clients[id] || {};

      nsData.clients[id] = { ...keyData, ...value };
      data[namespace] = nsData;

      this.write(data);
    });
  }

  async getClient(
    namespace: string,
    id: string
  ): Promise<ClientConfiguration | null> {
    return this.mutex.runExclusive(
      () => this.read()[namespace]?.clients?.[id] ?? null
    );
  }

  async clientValues(namespace: string): Promise<ClientConfiguration[]> {
    return this.mutex.runExclusive(() =>
      Object.values(this.read()[namespace]?.clients ?? {})
    );
  }

  async clientIds(namespace: string): Promise<string[]> {
    return this.mutex.runExclusive(() =>
      Object.keys(this.read()[namespace]?.clients ?? {})
    );
  }

  async destroyNamespace(namespace: string): Promise<void> {
    return this.mutex.runExclusive(() => {
      const data = this.read();
      Reflect.deleteProperty(data, namespace);
      this.write(data);
    });
  }

  private parseNamespace(
    namespace: AuthContextNamespace | undefined
  ): AuthContextNamespace {
    return {
      users: namespace?.users ?? {},
      clients: namespace?.clients ?? {},
    };
  }

  private write(data: Record<string, AuthContextNamespace>) {
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
        AuthContextNamespace
      >;
    } finally {
      fs.closeSync(fd);
    }
  }
}
