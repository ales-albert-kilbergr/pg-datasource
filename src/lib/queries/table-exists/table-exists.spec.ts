import { mock } from 'jest-mock-extended';
import type { QueryRunner } from '../../query-runner';
import { TableExistsQuery, build } from './table-exists.query';
import * as E from 'fp-ts/lib/Either';

describe('(Unit) TableExistsQuery', () => {
  describe('building a query config', () => {
    it('should build a correct sql query text with just a table and schema', () => {
      // Arrange
      const args = {
        table: 'testTableName',
        schema: 'testSchemaName',
      };
      // Act
      const result = build(args);
      // Assert
      expect(result).toMatchObject({
        text:
          'SELECT EXISTS (SELECT 1 FROM information_schema.tables ' +
          'WHERE table_schema = $1 AND table_name = $2' +
          ') as "exists";',
        values: ['testSchemaName', 'testTableName'],
      });
    });
  });

  describe('query execution', () => {
    it('should return true if the table exists', async () => {
      // Arrange
      const queryResult = mock<QueryRunner.Result>({
        rows: [{ exists: true }],
      });
      const queryRunner = mock<QueryRunner>();
      queryRunner.query.mockResolvedValue(E.right(queryResult));
      const query = TableExistsQuery.prepare(queryRunner, {
        table: 'testTableName',
        schema: 'testSchemaName',
      });
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(true);
      }
    });

    it('should return false if the table does not exist', async () => {
      // Arrange
      const queryResult = mock<QueryRunner.Result>({
        rows: [{ exists: false }],
      });
      const queryRunner = mock<QueryRunner>();
      queryRunner.query.mockResolvedValue(E.right(queryResult));
      const query = TableExistsQuery.prepare(queryRunner, {
        table: 'testTableName',
        schema: 'testSchemaName',
      });
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(false);
      }
    });
  });
});
