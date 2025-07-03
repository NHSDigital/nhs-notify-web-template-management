/* eslint-disable security/detect-non-literal-fs-filename */
import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';
import { Mutex } from 'async-mutex';
import type { TestUserContext } from './cognito-auth-helper';

type AuthContextNamespace = Record<string, TestUserContext>;

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

  async set(namespace: string, key: string, value: Partial<TestUserContext>) {
    await this.mutex.runExclusive(() => {
      const data = this.read();
      const nsData = data[namespace] || {};
      const keyData = nsData[key] || {};

      nsData[key] = { ...keyData, ...value };
      data[namespace] = nsData;

      this.write(data);
    });
  }

  async get(namespace: string, key: string): Promise<TestUserContext | null> {
    return this.mutex.runExclusive(() => this.read()[namespace]?.[key] || null);
  }

  async values(namespace: string): Promise<TestUserContext[]> {
    return this.mutex.runExclusive(() =>
      Object.values(this.read()[namespace] || {})
    );
  }

  async destroyNamespace(namespace: string): Promise<void> {
    return this.mutex.runExclusive(() => {
      const data = this.read();
      Reflect.deleteProperty(data, namespace);
      this.write(data);
    });
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
