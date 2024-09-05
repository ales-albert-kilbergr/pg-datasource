import type { QueryResultRow } from 'pg';
import {
  pickFirstRecord,
  pickNthRecord,
  processResultFlow,
  reduceToColumn,
  reduceToVoid,
  transformColumnKeysToCamelCase,
  transformRowToInstance,
} from './result-processors';
import { mock } from 'jest-mock-extended';
import type { QueryRunner } from '../../query-runner';
import type { SqlQuery } from './sql-query';

describe('(Unit) Result Processors', () => {
  describe('processResultFlow', () => {
    it('should first convert keys to camelCase and then transform to instance and than pick the first item', () => {
      // Arrange
      class Test {
        public columnName!: string;
      }
      const queryResult = mock<QueryRunner.Result>({
        rows: [{ column_name: 'value1' }, { column_name: 'value2' }],
      });
      const processorCtx = mock<SqlQuery.ResultProcessorArgs>({
        queryResult,
      });
      // Act
      const result = processResultFlow(
        transformColumnKeysToCamelCase(),
        transformRowToInstance(Test),
        pickFirstRecord(),
      )(processorCtx);
      // Assert
      expect(result).toBeInstanceOf(Test);
      expect(result.columnName).toEqual('value1');
    });
  });

  describe('pickNthRow', () => {
    it('should return the nth row', () => {
      // Arrange
      const rows: QueryResultRow[] = [
        { column: 'value1' },
        { column: 'value2' },
      ];
      // Act
      const result = pickNthRecord(1)(rows);
      // Assert
      expect(result).toEqual(rows[1]);
    });
  });

  describe('pickFirstRow', () => {
    it('should return the first row', () => {
      // Arrange
      const rows: QueryResultRow[] = [
        { column: 'value1' },
        { column: 'value2' },
      ];
      // Act
      const result = pickFirstRecord()(rows);
      // Assert
      expect(result).toEqual(rows[0]);
    });

    it('should return undefined if there are no rows', () => {
      // Arrange
      const rows: QueryResultRow[] = [];
      // Act
      const result = pickFirstRecord()(rows);
      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('transformColumnKeysToCamelCase', () => {
    it('should return an array of rows with camelCase keys', () => {
      // Arrange
      const rows: QueryResultRow[] = [
        { column_name: 'value1' },
        { column_name: 'value2' },
      ];
      // Act
      const result = transformColumnKeysToCamelCase()(rows);
      // Assert
      for (const row of result) {
        expect(row).toHaveProperty('columnName');
      }
    });

    it('should return an empty array if there are no rows', () => {
      // Arrange
      const rows: QueryResultRow[] = [];
      // Act
      const result = transformColumnKeysToCamelCase()(rows);
      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('transformRowToInstance', () => {
    it('should return an array of instances', () => {
      // Arrange
      class Test {
        public column!: string;
      }
      const rows: QueryResultRow[] = [
        { column: 'value1' },
        { column: 'value2' },
      ];
      // Act
      const result = transformRowToInstance(Test)(rows);
      // Assert
      // expect each element to be an instance of Test
      for (const instance of result) {
        expect(instance).toBeInstanceOf(Test);
      }
    });

    it('should return an empty array if there are no rows', () => {
      // Arrange
      class Test {
        public column!: string;
      }
      const rows: QueryResultRow[] = [];
      // Act
      const result = transformRowToInstance(Test)(rows);
      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('reduceToVoid', () => {
    it('should return void', () => {
      // Arrange
      // Act
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      const result = reduceToVoid()();
      // Assert
      expect(result).toEqual(void 0);
    });
  });

  describe('reduceToColumn', () => {
    it('should return an array of values in single column', () => {
      // Arrange
      const rows: QueryResultRow[] = [
        { column: 'value1' },
        { column: 'value2' },
      ];
      // Act
      const result = reduceToColumn('column')(rows);
      // Assert
      expect(result).toEqual(['value1', 'value2']);
    });

    it('should return an empty array if there are no rows', () => {
      // Arrange
      const rows: QueryResultRow[] = [];
      // Act
      const result = reduceToColumn('column')(rows);
      // Assert
      expect(result).toEqual([]);
    });
  });
});
