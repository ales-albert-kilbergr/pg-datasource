import { mock } from 'jest-mock-extended';
import { build, DropSchemaQuery } from './drop-schema.query';
import type { QueryRunner } from '../../query-runner';
import * as E from 'fp-ts/lib/Either';

describe('(Unit) DropSchemaQuery', () => {
  describe('building a query config', () => {
    it('should build a correct sql query text with just a schema', () => {
      // Arrange
      const args = {
        schema: 'testSchemaName',
      };
      // Act
      const result = build(args);
      // Assert
      expect(result).toMatchObject({
        text: 'DROP SCHEMA "testSchemaName";',
        values: [],
      });
    });

    it('should build a correct sql query with if exists flag', () => {
      // Arrange
      const args = {
        schema: 'testSchemaName',
        ifExists: true,
      };
      // Act
      const result = build(args);
      // Assert
      expect(result).toMatchObject({
        text: 'DROP SCHEMA IF EXISTS "testSchemaName";',
        values: [],
      });
    });

    it('should build a correct sql query with cascade flag', () => {
      // Arrange
      const args = {
        schema: 'testSchemaName',
        cascade: true,
      };
      // Act
      const result = build(args);
      // Assert
      expect(result).toMatchObject({
        text: 'DROP SCHEMA "testSchemaName" CASCADE;',
        values: [],
      });
    });
  });

  describe('query execution', () => {
    it('should return void if the schema is dropped', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const queryResult = mock<QueryRunner.Result>();
      const query = DropSchemaQuery.prepare(queryRunner, {
        schema: 'testSchemaName',
      });
      queryRunner.query.mockResolvedValueOnce(E.right(queryResult));
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(undefined);
      }
    });
  });
});
