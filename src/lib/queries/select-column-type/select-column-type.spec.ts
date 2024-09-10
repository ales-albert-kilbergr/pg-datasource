import { mock } from 'jest-mock-extended';
import { build, SelectColumnTypeQuery } from './select-column-type.query';
import type { QueryRunner } from '../../query-runner';
import type { SelectColumnTypeArgs } from './select-column-type.types';
import * as E from 'fp-ts/lib/Either';

describe('(Unit) SelectColumnTypeQuery', () => {
  describe('building a query config', () => {
    it('should build a correct sql query text', () => {
      // Arrange
      const args: SelectColumnTypeArgs = {
        schema: 'testSchemaName',
        table: 'testTableName',
        column: 'testColumnName',
      };
      // Act
      const result = build(args);
      // Assert
      expect(result).toMatchObject({
        text: 'SELECT data_type FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 AND column_name = $3;',
        values: ['testSchemaName', 'testTableName', 'testColumnName'],
      });
    });
  });

  describe('query execution', () => {
    it('should return the data type', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const queryResult = mock<QueryRunner.Result>({
        rows: [{ data_type: 'testDataType' }],
      });
      queryRunner.query.mockResolvedValue(E.right(queryResult));
      const query = SelectColumnTypeQuery.prepare(queryRunner).setArgs({
        schema: 'testSchemaName',
        table: 'testTableName',
        column: 'testColumnName',
      });
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe('testDataType');
      }
    });
  });
});
