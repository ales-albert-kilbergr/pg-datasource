import { build } from './drop-table.query';
import type { DropTableArgs } from './drop-table.types';

describe('(Unit) DropTableQuery', () => {
  describe('building a query config', () => {
    it('should build a correct sql query text with just a table and schema', () => {
      // Arrange
      const args: DropTableArgs = {
        tableName: 'testTableName',
        tableSchema: 'testSchemaName',
      };
      // Act
      const result = build(args);
      // Assert
      expect(result).toMatchObject({
        text: 'DROP TABLE "testSchemaName"."testTableName";',
        values: [],
      });
    });

    it('should build a correct sql query with if exists flag', () => {
      // Arrange
      const args: DropTableArgs = {
        tableName: 'testTableName',
        tableSchema: 'testSchemaName',
        ifExists: true,
      };
      // Act
      const result = build(args);
      // Assert
      expect(result).toMatchObject({
        text: 'DROP TABLE IF EXISTS "testSchemaName"."testTableName";',
        values: [],
      });
    });

    it('should build a correct sql query with cascade flag', () => {
      // Arrange
      const args: DropTableArgs = {
        tableName: 'testTableName',
        tableSchema: 'testSchemaName',
        cascade: true,
      };
      // Act
      const result = build(args);
      // Assert
      expect(result).toMatchObject({
        text: 'DROP TABLE "testSchemaName"."testTableName" CASCADE;',
        values: [],
      });
    });
  });
});
