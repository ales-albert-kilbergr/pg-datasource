import { mock } from 'jest-mock-extended';
import type { QueryRunner } from '../../query-runner';
import * as E from 'fp-ts/lib/Either';
import { SchemaExistsQuery, build } from './schema-exists.query';

describe('(Unit) SchemaExistsQuery', () => {
  describe('building a query config', () => {
    it('should build a correct sql query text with just a schema', () => {
      // Arrange
      const args = {
        schemaName: 'testSchemaName',
      };
      // Act
      const result = build(args);
      // Assert
      expect(result).toMatchObject({
        text:
          'SELECT EXISTS (SELECT 1 FROM information_schema.schemata ' +
          'WHERE schema_name = $1' +
          ') as "exists";',
        values: ['testSchemaName'],
      });
    });
  });

  describe('query execution', () => {
    it('should return true if the schema exists', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const queryResult = mock<QueryRunner.Result>({
        rows: [{ exists: true }],
      });
      const query = SchemaExistsQuery.prepare(queryRunner, {
        schemaName: 'public',
      });
      queryRunner.query.mockResolvedValueOnce(E.right(queryResult));
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(true);
      }
    });

    it('should return false if the schema does not exist', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const queryResult = mock<QueryRunner.Result>({
        rows: [{ exists: false }],
      });
      const query = SchemaExistsQuery.prepare(queryRunner, {
        schemaName: 'nonExistentSchema',
      });
      queryRunner.query.mockResolvedValueOnce(E.right(queryResult));
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
