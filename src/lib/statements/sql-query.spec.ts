/* eslint-disable @typescript-eslint/no-magic-numbers */
import { mock } from 'jest-mock-extended';
import { SqlQuery } from './sql-query';
import type { QueryRunner } from '../query-runner';
import { type QueryConfig, sql } from '@kilbergr/pg-sql';
import * as E from 'fp-ts/lib/Either';
import { DatabaseError } from 'pg';

describe('(Unit) SqlQuery', () => {
  describe('setArgs', () => {
    it('should set the args', () => {
      // Arrange
      const query = new SqlQuery(
        mock<QueryRunner>(),
        (): QueryConfig => sql`SELECT 1`,
      );
      const args = { test: 'test' };
      // Act
      query.setArgs(args);
      // Assert
      expect(query.getArgs()).toEqual(args);
    });

    it('should return the query', () => {
      // Arrange
      const query = new SqlQuery(
        mock<QueryRunner>(),
        (): QueryConfig => sql`SELECT 1`,
      );
      // Act
      const result = query.setArgs({ test: 'test' });
      // Assert
      expect(result).toBe(query);
    });

    it('should overwrite the args', () => {
      // Arrange
      const query = new SqlQuery(
        mock<QueryRunner>(),
        (): QueryConfig => sql`SELECT 1`,
      );
      const args = { test: 'test' };
      const newArgs = { test: 'newTest' };
      // Act
      query.setArgs(args);
      query.setArgs(newArgs);
      // Assert
      expect(query.getArgs()).toEqual(newArgs);
    });
  });

  describe('getArgs', () => {
    it('should return the args', () => {
      // Arrange
      const query = new SqlQuery(
        mock<QueryRunner>(),
        (): QueryConfig => sql`SELECT 1`,
      );
      const args = { test: 'test' };
      query.setArgs(args);
      // Act
      const result = query.getArgs();
      // Assert
      expect(result).toEqual(args);
    });

    it('should return an empty object if no args are set', () => {
      // Arrange
      const query = new SqlQuery(
        mock<QueryRunner>(),
        (): QueryConfig => sql`SELECT 1`,
      );
      // Act
      const result = query.getArgs();
      // Assert
      expect(result).toEqual({});
    });
  });

  describe('setArg', () => {
    it('should set the arg', () => {
      // Arrange
      const args = { test: 'test' };
      const query = new SqlQuery(
        mock<QueryRunner>(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_args: { test: string }): QueryConfig => sql`SELECT 1`,
      );
      const value = 'newTest';
      // Act
      query.setArgs(args);
      query.setArg('test', value);
      // Assert
      expect(query.getArgs()).toEqual({ test: 'newTest' });
    });

    it('should return the query', () => {
      // Arrange
      const query = new SqlQuery(
        mock<QueryRunner>(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_args: { test: string }): QueryConfig => sql`SELECT 1`,
      );
      // Act
      const result = query.setArg('test', 'test');
      // Assert
      expect(result).toBe(query);
    });

    it('should throw type error if arg does not exist', () => {
      // Arrange
      const query = new SqlQuery(
        mock<QueryRunner>(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_args: { test: string }): QueryConfig => sql`SELECT 1`,
      );
      // Act
      // Assert
      // @ts-expect-error - testing for type error
      query.setArg('test2', 'test');
    });
  });

  describe('getArg', () => {
    it('should return the arg', () => {
      // Arrange
      const args = { test: 'test' };
      const query = new SqlQuery(
        mock<QueryRunner>(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_args: { test: string }): QueryConfig => sql`SELECT 1`,
      );
      query.setArgs(args);
      // Act
      const result = query.getArg('test');
      // Assert
      expect(result).toEqual('test');
    });

    it('should return undefined if arg does not exist', () => {
      // Arrange
      const query = new SqlQuery(
        mock<QueryRunner>(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_args: { test: string }): QueryConfig => sql`SELECT 1`,
      );
      // Act
      const result = query.getArg('test');
      // Assert
      expect(result).toBeUndefined();
    });

    it('should throw type error if arg does not exist', () => {
      // Arrange
      const query = new SqlQuery(
        mock<QueryRunner>(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_args: { test: string }): QueryConfig => sql`SELECT 1`,
      );
      // Act
      // Assert
      // @ts-expect-error - testing for type error
      query.getArg('test2');
    });
  });

  describe('setDataProcessor', () => {
    it('should return the instance of the query', () => {
      // Arrange
      const query = new SqlQuery(
        mock<QueryRunner>(),
        (): QueryConfig => sql`SELECT 1`,
      );
      // Act
      const result = query.setDataProcessor(() => 'test');
      // Assert
      expect(result).toBe(query);
    });

    it('should alter the sql query DATA generic type', () => {
      // Arrange
      const query = new SqlQuery(
        mock<QueryRunner>(),
        (): QueryConfig => sql`SELECT 1`,
      );
      // Act
      const result: SqlQuery<object, string> = query.setDataProcessor(
        () => 'test',
      );
      // Assert
      expect(result).toBe(query);
    });
  });

  describe('addErrorProcessor', () => {
    it('should return the instance of the query', () => {
      // Arrange
      const query = new SqlQuery(
        mock<QueryRunner>(),
        (): QueryConfig => sql`SELECT 1`,
      );
      // Act
      const result = query.addErrorHandler(() => 'test');
      // Assert
      expect(result).toBe(query);
    });

    it('should alter the sql query ERROR generic type', () => {
      // Arrange
      const query = new SqlQuery(
        mock<QueryRunner>(),
        (): QueryConfig => sql`SELECT 1`,
      );
      // Act
      const result: SqlQuery<
        object,
        QueryRunner.Result,
        string | DatabaseError
      > = query.addErrorHandler(() => 'test');
      // Assert
      expect(result).toBe(query);
    });
  });

  describe('getQueryConfig', () => {
    it('should return the query config', () => {
      // Arrange
      const queryConfig = sql`SELECT 1`;
      const query = new SqlQuery(
        mock<QueryRunner>(),
        (): QueryConfig => queryConfig,
      );
      // Act
      const result = query.getQueryConfig();
      // Assert
      expect(result).toBe(queryConfig);
    });
  });

  describe('execute', () => {
    it('should execute the query', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>({
        query: jest.fn().mockResolvedValue(E.right(mock<QueryRunner.Result>())),
      });
      const query = new SqlQuery(queryRunner, (): QueryConfig => sql`SELECT 1`);
      // Act
      await query.execute();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(queryRunner.query).toHaveBeenCalledTimes(1);
    });

    it('should pass the query config to the query runner', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>({
        query: jest.fn().mockResolvedValue(E.right(mock<QueryRunner.Result>())),
      });
      const queryConfig = sql`SELECT 1`;
      const query = new SqlQuery(queryRunner, (): QueryConfig => queryConfig);
      // Act
      await query.execute();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(queryRunner.query).toHaveBeenCalledWith(queryConfig);
    });

    it('should return the result of the query runner', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const queryResult = mock<QueryRunner.Result>();
      queryRunner.query.mockResolvedValue(E.right(queryResult));
      const query = new SqlQuery(queryRunner, (): QueryConfig => sql`SELECT 1`);
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(queryResult);
      }
    });

    it('should return the error of the query runner', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const error = new DatabaseError('test', 1, 'error');
      queryRunner.query.mockResolvedValue(E.left(error));
      const query = new SqlQuery(queryRunner, (): QueryConfig => sql`SELECT 1`);
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(error);
      }
    });

    it('should process the data if a data processor is set', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const queryResult = mock<QueryRunner.Result>();
      queryRunner.query.mockResolvedValue(E.right(queryResult));
      const query = new SqlQuery(queryRunner, (): QueryConfig => sql`SELECT 1`);
      const dataProcessor = jest.fn().mockReturnValue('test');
      query.setDataProcessor(dataProcessor);
      // Act
      await query.execute();
      // Assert
      expect(dataProcessor).toHaveBeenCalledTimes(1);
    });

    it('should return the processed data', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const queryResult = mock<QueryRunner.Result>();
      queryRunner.query.mockResolvedValue(E.right(queryResult));
      const query: SqlQuery<object, string> = new SqlQuery(
        queryRunner,
        (): QueryConfig => sql`SELECT 1`,
      ).setDataProcessor(() => 'test');
      // Act
      const result: E.Either<DatabaseError, string> = await query.execute();
      // Assert
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe('test');
      }
    });

    it('should process the error if an error processor is set', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const error = new DatabaseError('test', 1, 'error');
      queryRunner.query.mockResolvedValue(E.left(error));
      const query = new SqlQuery(queryRunner, (): QueryConfig => sql`SELECT 1`);
      const errorProcessor = jest.fn().mockReturnValue('test');
      query.addErrorHandler(errorProcessor);
      // Act
      await query.execute();
      // Assert
      expect(errorProcessor).toHaveBeenCalledTimes(1);
    });

    it('should return the processed error', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const error = new DatabaseError('test', 1, 'error');
      queryRunner.query.mockResolvedValue(E.left(error));
      const query: SqlQuery<
        object,
        QueryRunner.Result,
        string | DatabaseError
      > = new SqlQuery(
        queryRunner,
        (): QueryConfig => sql`SELECT 1`,
      ).addErrorHandler(() => 'test');
      // Act
      const result: E.Either<string | DatabaseError, QueryRunner.Result> =
        await query.execute();
      // Assert
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe('test');
      }
    });

    it('should return the second processed error if the first returns undefined', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const error = new DatabaseError('test', 1, 'error');
      queryRunner.query.mockResolvedValue(E.left(error));
      const query: SqlQuery<
        object,
        QueryRunner.Result,
        number | DatabaseError
      > = new SqlQuery(queryRunner, (): QueryConfig => sql`SELECT 1`)
        .addErrorHandler(() => void 0)
        .addErrorHandler(() => 42);
      // Act
      const result: E.Either<number | DatabaseError, QueryRunner.Result> =
        await query.execute();
      // Assert
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(42);
      }
    });

    it('should return the second processed error if the first returns null', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const error = new DatabaseError('test', 1, 'error');
      queryRunner.query.mockResolvedValue(E.left(error));
      const query: SqlQuery<
        object,
        QueryRunner.Result,
        number | DatabaseError
      > = new SqlQuery(queryRunner, (): QueryConfig => sql`SELECT 1`)
        .addErrorHandler(() => null)
        .addErrorHandler(() => 42);
      // Act
      const result: E.Either<number | DatabaseError, QueryRunner.Result> =
        await query.execute();
      // Assert
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(42);
      }
    });

    it('should return the original error if no error processor is set', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const error = new DatabaseError('test', 1, 'error');
      queryRunner.query.mockResolvedValue(E.left(error));
      const query = new SqlQuery(queryRunner, (): QueryConfig => sql`SELECT 1`);
      // Act
      const result = await query.execute();
      // Assert
      expect(result).toEqual(E.left(error));
    });

    it('should return the original error if no error processors can process it', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const error = new DatabaseError('test', 1, 'error');
      queryRunner.query.mockResolvedValue(E.left(error));
      const query = new SqlQuery(queryRunner, (): QueryConfig => sql`SELECT 1`);
      query.addErrorHandler(() => null);
      // Act
      const result = await query.execute();
      // Assert
      expect(result).toEqual(E.left(error));
    });
  });
});
