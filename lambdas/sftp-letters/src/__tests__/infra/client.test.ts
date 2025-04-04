import crypto from 'node:crypto';
import { Readable } from 'node:stream';
import Client, { FileInfo as SftpFileInfo } from 'ssh2-sftp-client';
import { SftpClient, FileInfo } from '../../infra/client';

const HOST = 'sftp.example.com';
const USERNAME = 'example-username';
const PRIVATE_KEY = 'example-private-key';
const HOST_KEY = 'example-host-key';
const EXPECTED_HOST_KEY = `SHA256:${crypto
  .createHash('sha256')
  .update('example-host-key')
  .digest('base64')}`;

jest.mock('ssh2-sftp-client', () =>
  jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockImplementation(async (config) => {
      const hostVerifier = config.hostVerifier as (key: Buffer) => boolean;
      const isVerified = hostVerifier(Buffer.from(HOST_KEY));
      if (isVerified) {
        return;
      }

      throw new Error('Host key verification failed');
    }),
    end: jest.fn(),
    put: jest.fn(),
    mkdir: jest.fn(),
    list: jest.fn(),
    exists: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
    rename: jest.fn(),
  }))
);

const mockClient = new Client();

const toSftpFileInfo = (info: FileInfo): SftpFileInfo => ({
  ...info,
  size: 0,
  accessTime: 0,
  rights: {
    user: 'rwx',
    group: 'rwx',
    other: 'rwx',
  },
  owner: 0,
  group: 0,
});

let sftpClient: SftpClient;

beforeEach(() => {
  jest.mocked(Client).mockImplementation(() => mockClient);
  sftpClient = new SftpClient(HOST, USERNAME, PRIVATE_KEY, EXPECTED_HOST_KEY);
});

describe('sftpClient', () => {
  describe('constructor', () => {
    it('instantiates a client', () => {
      expect(Client).toHaveBeenCalled();
    });
  });

  describe('connect', () => {
    it('connects using the given config', async () => {
      await sftpClient.connect();

      expect(mockClient.connect).toHaveBeenCalledWith({
        host: HOST,
        username: USERNAME,
        privateKey: PRIVATE_KEY,
        hostVerifier: expect.any(Function),
      });
    });

    it('should fail to connect when the host key does not match', async () => {
      const expectedHostKey = crypto
        .createHash('sha256')
        .update('invalid-host-key')
        .digest('base64');
      const invalidSftpClient = new SftpClient(
        HOST,
        USERNAME,
        PRIVATE_KEY,
        expectedHostKey
      );

      await expect(invalidSftpClient.connect()).rejects.toThrow(
        'Host key verification failed'
      );
    });
  });

  describe('end', () => {
    it('ends the client connection', async () => {
      await sftpClient.end();

      expect(mockClient.end).toHaveBeenCalled();
    });
  });

  describe('put', () => {
    it('puts the given input stream to the given location', async () => {
      const stream = new Readable();
      const location = '/some/location';
      await sftpClient.put(stream, location);

      expect(mockClient.put).toHaveBeenCalledWith(stream, location);
    });
  });

  describe('mkdir', () => {
    it('creates a directory at location', async () => {
      const location = '/some/location';
      const recursive = true;
      await sftpClient.mkdir(location, recursive);

      expect(mockClient.mkdir).toHaveBeenCalledWith(location, recursive);
    });
  });

  describe('list', () => {
    it('lists files at location', async () => {
      const files: FileInfo[] = [
        { name: 'example-1', type: 'd', modifyTime: 0 },
        { name: 'example-2', type: '-', modifyTime: 1 },
        { name: 'example-3', type: 'l', modifyTime: 2 },
      ];

      jest
        .mocked(mockClient)
        .list.mockResolvedValueOnce(files.map((file) => toSftpFileInfo(file)));

      const location = '/some/location';
      const result = await sftpClient.list(location);

      expect(mockClient.list).toHaveBeenCalledWith(location);
      expect(result).toEqual(files);
    });
  });

  describe('exists', () => {
    it('checks if file exists at location', async () => {
      jest.mocked(mockClient).exists.mockResolvedValueOnce(false);

      const location = '/some/location';
      const result = await sftpClient.exists(location);

      expect(mockClient.exists).toHaveBeenCalledWith(location);
      expect(result).toEqual(false);
    });
  });

  describe('get', () => {
    it('gets the file at location to the destination', async () => {
      const file = 'mock-file';
      jest.mocked(mockClient).get.mockResolvedValueOnce(file);

      const location = '/some/location';
      const destination = '/some/destination';
      const result = await sftpClient.get(location, destination);

      expect(mockClient.get).toHaveBeenCalledWith(location, destination);
      expect(result).toEqual(file);
    });
  });

  describe('delete', () => {
    it('deletes file at location', async () => {
      const location = '/some/location';
      await sftpClient.delete(location);

      expect(mockClient.delete).toHaveBeenCalledWith(location);
    });
  });

  describe('rename', () => {
    it('renames the file', async () => {
      const location = '/some/location';
      const destination = '/some/destination';
      await sftpClient.rename(location, destination);

      expect(mockClient.rename).toHaveBeenCalledWith(location, destination);
    });
  });
});
