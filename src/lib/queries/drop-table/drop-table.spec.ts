import { mock } from 'jest-mock-extended';
import type { QueryRunner } from '../../query-runner';
import { DropTableQuery } from './drop-table';
import * as E from 'fp-ts/lib/Either';
import { DatabaseError } from 'pg';

describe('(Unit) DropTableQuery', () => {
  describe('tableName', () => {
    it('should set the table name', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new DropTableQuery(queryRunner);
      // Act
      query.tableName('test');
      // Assert
      expect(query.tableName()).toBe('test');
    });

    it('should return reference to self', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new DropTableQuery(queryRunner);
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
      const query = new DropTableQuery(queryRunner);
      // Act
      query.tableSchema('test');
      // Assert
      expect(query.tableSchema()).toBe('test');
    });

    it('should return reference to self', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new DropTableQuery(queryRunner);
      // Act
      const result = query.tableSchema('test');
      // Assert
      expect(result).toBe(query);
    });
  });

  describe('cascade', () => {
    it('should set the cascade option', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new DropTableQuery(queryRunner);
      // Act
      query.cascade(true);
      // Assert
      expect(query.cascade()).toBe(true);
    });

    it('should return reference to self', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new DropTableQuery(queryRunner);
      // Act
      const result = query.cascade(false);
      // Assert
      expect(result).toBe(query);
    });
  });

  describe('ifExists', () => {
    it('should set the if exists option', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new DropTableQuery(queryRunner);
      // Act
      query.ifExists(true);
      // Assert
      expect(query.ifExists()).toBe(true);
    });

    it('should return reference to self', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new DropTableQuery(queryRunner);
      // Act
      const result = query.ifExists(false);
      // Assert
      expect(result).toBe(query);
    });
  });

  describe('execute', () => {
    it('should return a void as a result', async () => {
      // Arrange
      const queryResult = mock<QueryRunner.Result>({
        rows: [],
      });
      const queryRunner = mock<QueryRunner>({
        query: jest.fn().mockResolvedValue(E.right(queryResult)),
      });
      const query = new DropTableQuery(queryRunner)
        .tableName('test_table')
        .tableSchema('test_schema');
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBeUndefined();
      }
    });

    it('should build a correct sql query text without cascade', async () => {
      // Arrange
      const queryResult = mock<QueryRunner.Result>({
        rows: [],
      });
      const queryRunner = mock<QueryRunner>({
        query: jest.fn().mockResolvedValue(E.right(queryResult)),
      });
      const query = new DropTableQuery(queryRunner)
        .tableName('test_table')
        .tableSchema('test_schema');
      // Act
      await query.execute();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'DROP TABLE "test_schema"."test_table";',
        }),
      );
    });

    it('should build a correct sql query text with cascade', async () => {
      // Arrange
      const queryResult = mock<QueryRunner.Result>({
        rows: [],
      });
      const queryRunner = mock<QueryRunner>({
        query: jest.fn().mockResolvedValue(E.right(queryResult)),
      });
      const query = new DropTableQuery(queryRunner)
        .tableName('test_table')
        .tableSchema('test_schema')
        .cascade(true);
      // Act
      await query.execute();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'DROP TABLE "test_schema"."test_table" CASCADE;',
        }),
      );
    });

    it('should build a correct sql query text with if exists', async () => {
      // Arrange
      const queryResult = mock<QueryRunner.Result>({
        rows: [],
      });
      const queryRunner = mock<QueryRunner>({
        query: jest.fn().mockResolvedValue(E.right(queryResult)),
      });
      const query = new DropTableQuery(queryRunner)
        .tableName('test_table')
        .tableSchema('test_schema')
        .ifExists(true);
      // Act
      await query.execute();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'DROP TABLE IF EXISTS "test_schema"."test_table";',
        }),
      );
    });

    it('should return an error if the table name is missing', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new DropTableQuery(queryRunner).tableSchema('test_schema');
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.code).toBe(
          DropTableQuery.VALUE_ERROR_CODE.ERR_MISSING_TABLE_NAME,
        );
      }
    });

    it('should return an error if the table schema is missing', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const query = new DropTableQuery(queryRunner).tableName('test_table');
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.code).toBe(
          DropTableQuery.VALUE_ERROR_CODE.ERR_MISSING_TABLE_SCHEMA,
        );
      }
    });

    it('should return a DatabaseError if the query fails', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      queryRunner.query.mockResolvedValue(
        E.left(new DatabaseError('test', 0, 'error')),
      );
      const query = new DropTableQuery(queryRunner)
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
