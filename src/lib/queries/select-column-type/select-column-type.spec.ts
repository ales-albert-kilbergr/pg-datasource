import { mock } from 'jest-mock-extended';
import type { QueryRunner } from '../../query-runner';
import { SelectColumnTypeQuery } from './select-column-type';
import * as E from 'fp-ts/lib/Either';
import { DatabaseError } from 'pg';

describe('(Unit) SelectColumnTypeQuery', () => {
  describe('tableName', () => {
    it('should set the table name', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new SelectColumnTypeQuery(queryRunner);
      // Act
      query.tableName('test');
      // Assert
      expect(query.tableName()).toBe('test');
    });

    it('should return reference to self', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new SelectColumnTypeQuery(queryRunner);
      // Act
      const result = query.tableName('test');
      // Assert
      expect(result).toBe(query);
    });
  });

  describe('tableSchema', () => {
    it('should set the table schema', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new SelectColumnTypeQuery(queryRunner);
      // Act
      query.tableSchema('test');
      // Assert
      expect(query.tableSchema()).toBe('test');
    });

    it('should return reference to self', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new SelectColumnTypeQuery(queryRunner);
      // Act
      const result = query.tableSchema('test');
      // Assert
      expect(result).toBe(query);
    });
  });

  describe('columnName', () => {
    it('should set the column name', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new SelectColumnTypeQuery(queryRunner);
      // Act
      query.columnName('test');
      // Assert
      expect(query.columnName()).toBe('test');
    });

    it('should return reference to self', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new SelectColumnTypeQuery(queryRunner);
      // Act
      const result = query.columnName('test');
      // Assert
      expect(result).toBe(query);
    });
  });

  describe('execute', () => {
    it('should return an error if the table name is not set', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new SelectColumnTypeQuery(queryRunner);
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.code).toBe(
          SelectColumnTypeQuery.VALUE_ERROR_CODE.ERR_MISSING_TABLE_NAME,
        );
      }
    });

    it('should return an error if the table schema is not set', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new SelectColumnTypeQuery(queryRunner).tableName('test');
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.code).toBe(
          SelectColumnTypeQuery.VALUE_ERROR_CODE.ERR_MISSING_TABLE_SCHEMA,
        );
      }
    });

    it('should return an error if the column name is not set', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new SelectColumnTypeQuery(queryRunner)
        .tableName('test')
        .tableSchema('test');
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.code).toBe(
          SelectColumnTypeQuery.VALUE_ERROR_CODE.ERR_MISSING_COLUMN_NAME,
        );
      }
    });

    it('should return the column type', async () => {
      // Arrange
      const queryResult = mock<QueryRunner.Result>({
        rows: [{ data_type: 'test' }],
      });
      const queryRunner = mock<QueryRunner>();
      queryRunner.query.mockResolvedValue(E.right(queryResult));
      const query = new SelectColumnTypeQuery(queryRunner)
        .tableName('test')
        .tableSchema('test')
        .columnName('test');
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe('test');
      }
    });

    it('should return undefined if the column does not exist', async () => {
      // Arrange
      const queryResult = mock<QueryRunner.Result>({
        rows: [],
      });
      const queryRunner = mock<QueryRunner>();
      queryRunner.query.mockResolvedValue(E.right(queryResult));
      const query = new SelectColumnTypeQuery(queryRunner)
        .tableName('test')
        .tableSchema('test')
        .columnName('test');
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBeUndefined();
      }
    });

    it('should build a correct sql query text', async () => {
      // Arrange
      const queryResult = mock<QueryRunner.Result>({
        rows: [{ data_type: 'test' }],
      });
      const queryRunner = mock<QueryRunner>();
      queryRunner.query.mockResolvedValue(E.right(queryResult));
      const query = new SelectColumnTypeQuery(queryRunner)
        .tableName('test_table')
        .tableSchema('test_schema')
        .columnName('test_column');
      // Act
      await query.execute();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'SELECT data_type FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 AND column_name = $3;',
          values: ['test_schema', 'test_table', 'test_column'],
        }),
      );
    });

    it('should return a DatabaseError if the query fails', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      queryRunner.query.mockResolvedValue(
        E.left(new DatabaseError('test', 0, 'error')),
      );
      const query = new SelectColumnTypeQuery(queryRunner)
        .tableName('test_table')
        .tableSchema('test_schema')
        .columnName('test_column');
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBeInstanceOf(DatabaseError);
      }
    });
  });
});
