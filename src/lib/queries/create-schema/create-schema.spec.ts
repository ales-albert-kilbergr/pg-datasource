import type { CreateSchemaArgs } from './create-schema.args';
import { build } from './create-schema.query';

describe('(Unit) CreateSchema', () => {
  describe('building a query config', () => {
    it('should build a correct sql query text with just a schema', () => {
      // Arrange
      const args: CreateSchemaArgs = {
        schema: 'testSchemaName',
      };
      // Act
      const result = build(args);
      // Assert
      expect(result).toMatchObject({
        text: 'CREATE SCHEMA "testSchemaName";',
        values: [],
      });
    });

    it('should build a correct sql query with if not exists flag', () => {
      // Arrange
      const args: CreateSchemaArgs = {
        schema: 'testSchemaName',
        ifNotExists: true,
      };
      // Act
      const result = build(args);
      // Assert
      expect(result).toMatchObject({
        text: 'CREATE SCHEMA IF NOT EXISTS "testSchemaName";',
        values: [],
      });
    });

    it('should build a correct sql query with authorization', () => {
      // Arrange
      const args: CreateSchemaArgs = {
        schema: 'testSchemaName',
        authorization: 'testRole',
      };
      // Act
      const result = build(args);
      // Assert
      expect(result).toMatchObject({
        text: 'CREATE SCHEMA "testSchemaName" AUTHORIZATION "testRole";',
        values: [],
      });
    });
  });
});
