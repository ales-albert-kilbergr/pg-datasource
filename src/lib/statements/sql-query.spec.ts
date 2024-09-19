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
      const query = new SqlQuery(mock<QueryRunner>(), {
        build: (): QueryConfig => sql`SELECT 1`,
      });
      const args = { test: 'test' };
      // Act
      query.setArgs(args);
      // Assert
      expect(query.getArgs()).toEqual(args);
    });

    it('should return the query', () => {
      // Arrange
      const query = new SqlQuery(mock<QueryRunner>(), {
        build: (): QueryConfig => sql`SELECT 1`,
      });
      // Act
      const result = query.setArgs({ test: 'test' });
      // Assert
      expect(result).toBe(query);
    });

    it('should overwrite the args', () => {
      // Arrange
      const query = new SqlQuery(mock<QueryRunner>(), {
        build: (): QueryConfig => sql`SELECT 1`,
      });
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
      const query = new SqlQuery(mock<QueryRunner>(), {
        build: (): QueryConfig => sql`SELECT 1`,
      });
      const args = { test: 'test' };
      query.setArgs(args);
      // Act
      const result = query.getArgs();
      // Assert
      expect(result).toEqual(args);
    });

    it('should return an empty object if no args are set', () => {
      // Arrange
      const query = new SqlQuery(mock<QueryRunner>(), {
        build: (): QueryConfig => sql`SELECT 1`,
      });
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
      const query = new SqlQuery(mock<QueryRunner>(), {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        build: (_args: { test: string }): QueryConfig => sql`SELECT 1`,
      });
      const value = 'newTest';
      // Act
      query.setArgs(args);
      query.setArg('test', value);
      // Assert
      expect(query.getArgs()).toEqual({ test: 'newTest' });
    });

    it('should return the query', () => {
      // Arrange
      const query = new SqlQuery(mock<QueryRunner>(), {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        build: (_args: { test: string }): QueryConfig => sql`SELECT 1`,
      });
      // Act
      const result = query.setArg('test', 'test');
      // Assert
      expect(result).toBe(query);
    });

    it('should throw type error if arg does not exist', () => {
      // Arrange
      const query = new SqlQuery(mock<QueryRunner>(), {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        build: (_args: { test: string }): QueryConfig => sql`SELECT 1`,
      });
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
      const query = new SqlQuery(mock<QueryRunner>(), {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        build: (_args: { test: string }): QueryConfig => sql`SELECT 1`,
      });
      query.setArgs(args);
      // Act
      const result = query.getArg('test');
      // Assert
      expect(result).toEqual('test');
    });

    it('should return undefined if arg does not exist', () => {
      // Arrange
      const query = new SqlQuery(mock<QueryRunner>(), {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        build: (_args: { test: string }): QueryConfig => sql`SELECT 1`,
      });
      // Act
      const result = query.getArg('test');
      // Assert
      expect(result).toBeUndefined();
    });

    it('should throw type error if arg does not exist', () => {
      // Arrange
      const query = new SqlQuery(mock<QueryRunner>(), {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        build: (_args: { test: string }): QueryConfig => sql`SELECT 1`,
      });
      // Act
      // Assert
      // @ts-expect-error - testing for type error
      query.getArg('test2');
    });
  });

  describe('execute', () => {
    it('should execute the query', async () => {
      // Arrange
      const queryRunner = mock<QueryRunner>({
        query: jest.fn().mockResolvedValue(E.right(mock<QueryRunner.Result>())),
      });
      const query = new SqlQuery(queryRunner, {
        build: (): QueryConfig => sql`SELECT 1`,
      });
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
      const query = new SqlQuery(queryRunner, {
        build: (): QueryConfig => queryConfig,
      });
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
      const query = new SqlQuery(queryRunner, {
        build: (): QueryConfig => sql`SELECT 1`,
      });
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
      const query = new SqlQuery(queryRunner, {
        build: (): QueryConfig => sql`SELECT 1`,
      });
      // Act
      const result = await query.execute();
      // Assert
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(error);
      }
    });
  });
});
