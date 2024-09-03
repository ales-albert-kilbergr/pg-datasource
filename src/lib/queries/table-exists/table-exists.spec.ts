import { mock } from 'jest-mock-extended';
import type { QueryRunner } from '../../query-runner';
import { TableExistsQuery } from './table-exists';
import * as E from 'fp-ts/lib/Either';
import { InvalidQueryArgError } from '../invalid-query-arg-error';
import { DatabaseError } from 'pg';

describe('(Unit) TableExistsQuery', () => {
  describe('tableName', () => {
    it('should set the table name', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new TableExistsQuery(queryRunner);
      // Act
      query.tableName('test');
      // Assert
      expect(query.tableName()).toBe('test');
    });

    it('should return reference to self', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new TableExistsQuery(queryRunner);
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
      const query = new TableExistsQuery(queryRunner);
      // Act
      query.tableSchema('test');
      // Assert
      expect(query.tableSchema()).toBe('test');
    });

    it('should return reference to self', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new TableExistsQuery(queryRunner);
      // Act
      const result = query.tableSchema('test');
      // Assert
      expect(result).toBe(query);
    });
  });

  describe('execute', () => {
    it('should return true if the table exists', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const queryResult = mock<QueryRunner.Result>({
        rows: [{ exists: true }],
      });

      queryRunner.query.mockResolvedValue(E.right(queryResult));
      const query = new TableExistsQuery(queryRunner)
        .tableName('test_table')
        .tableSchema('test_schema');
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
      const queryRunner = mock<QueryRunner>();
      const queryResult = mock<QueryRunner.Result>({
        rows: [{ exists: false }],
      });

      queryRunner.query.mockResolvedValue(E.right(queryResult));
      const query = new TableExistsQuery(queryRunner)
        .tableName('test_table')
        .tableSchema('test_schema');
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(false);
      }
    });

    it('should return an error if the table name is missing', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new TableExistsQuery(queryRunner).tableSchema(
        'test_schema',
      );
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBeInstanceOf(InvalidQueryArgError);
        expect(result.left.code).toBe(
          TableExistsQuery.VALUE_ERROR_CODE.ERR_MISSING_TABLE_NAME,
        );
      }
    });

    it('should return an error if the table schema is missing', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new TableExistsQuery(queryRunner).tableName('test_table');
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBeInstanceOf(InvalidQueryArgError);
        expect(result.left.code).toBe(
          TableExistsQuery.VALUE_ERROR_CODE.ERR_MISSING_TABLE_SCHEMA,
        );
      }
    });

    it('should build a valid sql query string', async () => {
      // Arrange
      const queryResult = mock<QueryRunner.Result>({
        rows: [{ exists: true }],
      });
      const queryRunner = mock<QueryRunner>({
        query: jest.fn().mockResolvedValue(E.right(queryResult)),
      });
      const query = new TableExistsQuery(queryRunner)
        .tableName('test_table')
        .tableSchema('test_schema');
      // Act
      await query.execute();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2) as "exists";',
        }),
      );
    });

    it('should return a DatabaseError if occurs wrapped in the Either', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      queryRunner.query.mockResolvedValue(
        E.left(new DatabaseError('test', 0, 'error')),
      );
      const query = new TableExistsQuery(queryRunner)
        .tableName('test_table')
        .tableSchema('test_schema');
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
