# User Transfer Data Migration

The purpose of this tool is to transfer templates stored in DynamoDB from one owner to another. It does not transfer ownership of any files in S3, this would need to be done separately.

The owner field is the partition key for database entries and as such they are deleted and re-created with the new owner. They will retain their unique ID.

A local backup of the data is persisted before any updates into a `./backup` directory.

## Parameters - updated

| Parameter          | Optional | Description                                     |
| ------------------ | -------- | ----------------------------------------------- |
| --sourceOwner      | Required | The current owner of the data, typically a UUID |
| --destinationOwner | Required | The new owner of the data, typically a UUID     |
| --environment      | Required | The environment name, e.g. main                 |
|                    |          |                                                 |

## Authentication

You should establish a local AWS authentication session to the target AWS account with sufficient permissions to read, write and delete template data from DynamoDB.

## Example

```shell
npm run transfer -- --sourceOwner 26d202d4-f001-7043-1781-77c935224d18 --destinationOwner e6f232b4-6051-7096-a238-5527b8615d11 --environment main
```
