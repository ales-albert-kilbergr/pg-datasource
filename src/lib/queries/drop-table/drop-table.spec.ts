import { mock } from 'jest-mock-extended';
import type { QueryRunner } from '../../query-runner';
import { DropTableQuery, build } from './drop-table.query';
import * as E from 'fp-ts/lib/Either';
import { ValidationError } from 'joi';
import type { DropTableArgs } from './drop-table.types';

describe('(Unit) DropTableQuery', () => {
  describe('validation before building a query config', () => {
    it('should return an error if the table name is missing', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      // @ts-expect-error - ignore missing properties for test
      const query = DropTableQuery.prepare(queryRunner, {
        tableSchema: 'testSchemaName',
      });
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBeInstanceOf(ValidationError);
        expect(result.left.message).toContain('Table name not set.');
      }
    });

    it('should return an error if the table schema is missing', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      // @ts-expect-error - ignore missing properties for test
      const query = DropTableQuery.prepare(queryRunner, {
        tableName: 'testTableName',
      });
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBeInstanceOf(ValidationError);
        expect(result.left.message).toContain('Table schema not set.');
      }
    });
  });

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
