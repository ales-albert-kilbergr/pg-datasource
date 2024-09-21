/* eslint-disable @typescript-eslint/no-magic-numbers */
import { type QueryConfig, sql } from '@kilbergr/pg-sql';
import { SqlStatement } from './sql-statement';
import { mock } from 'jest-mock-extended';
import type { QueryRunner } from '../query-runner';
import { DatabaseError } from 'pg';
import { SqlQuery } from './sql-query';

describe('(Unit) SqlStatement', () => {
  describe('from', () => {
    it('should build a statement from a query config builder', () => {
      // Arrange
      const queryConfigBuilder = (): QueryConfig => sql`SELECT 1`;
      // Act
      const statement = SqlStatement.from(queryConfigBuilder);
      // Assert
      expect(statement).toBeInstanceOf(SqlStatement);
    });
  });

  describe('processData', () => {
    it('should return a new statement after setting a data processor and alter the DATA type', () => {
      // Arrange
      const statement = SqlStatement.from(() => sql`SELECT 1`);
      const dataProcessor = (): number => 1;
      // Act
      const newStatement: SqlStatement<object, number> =
        statement.processData(dataProcessor);
      // Assert
      expect(newStatement).toBeInstanceOf(SqlStatement);
    });
  });

  describe('processDataFlow', () => {
    it('should return a new statement after setting a data processor and alter the DATA type', () => {
      // Arrange
      const statement = SqlStatement.from(() => sql`SELECT 1`);
      const dataProcessorOne = (): number => 1;
      const dataProcessorTwo = (): boolean => false;
      // Act
      const newStatement: SqlStatement<object, boolean> =
        statement.processDataFlow(dataProcessorOne, dataProcessorTwo);
      // Assert
      expect(newStatement).toBeInstanceOf(SqlStatement);
    });

    it('should build a chained execution of data processors', () => {
      // Arrange
      const statement = SqlStatement.from(() => sql`SELECT 1`);
      const dataProcessorOne = (): number => 1;
      const dataProcessorTwo = (prevNum: number): number => prevNum + 1;
      // Act
      const newStatement: SqlStatement<object, number> =
        statement.processDataFlow(dataProcessorOne, dataProcessorTwo);
      const dataProcessor = newStatement.getDataProcessor();
      let result = 0;
      if (dataProcessor) {
        result = dataProcessor({
          queryResult: mock<QueryRunner.Result>(),
          queryConfig: sql`SELECT 1`,
          args: {},
        });
      }
      // Assert
      expect(result).toBe(2);
    });
  });

  describe('processResultToVoid', () => {
    it('should return a new statement after setting a data processor and alter the DATA type', () => {
      // Arrange
      const statement = SqlStatement.from(() => sql`SELECT 1`);
      // Act
      const newStatement: SqlStatement<object, void> =
        statement.processResultToVoid();
      // Assert
      expect(newStatement).toBeInstanceOf(SqlStatement);
    });
  });

  describe('matchError', () => {
    it('should return a new statement after setting an error matcher', () => {
      // Arrange
      const errorMatcher = (): boolean => false;
      const statement: SqlStatement<
        object,
        QueryRunner.Result,
        DatabaseError | Error
      > = SqlStatement.from(() => sql`SELECT 1`).matchError(
        errorMatcher,
        () => new Error('Error message'),
      );
      // Assert
      expect(statement).toBeInstanceOf(SqlStatement);
    });

    it('should alter the ERROR type based on the error matcher', () => {
      // Arrange
      const errorMatcher = (): boolean => false;
      class MyError extends Error {}
      const statement: SqlStatement<
        object,
        QueryRunner.Result,
        DatabaseError | MyError
      > = SqlStatement.from(() => sql`SELECT 1`).matchError(
        errorMatcher,
        () => new MyError('Error message'),
      );
      // Assert
      expect(statement).toBeInstanceOf(SqlStatement);
    });

    it('should return a matching error if the mather returns true', () => {
      // Arrange
      const errorMatcher = (): boolean => true;
      const mappedError = new Error('Error message');
      const statement: SqlStatement<
        object,
        QueryRunner.Result,
        DatabaseError | Error
      > = SqlStatement.from(() => sql`SELECT 1`).matchError(
        errorMatcher,
        () => mappedError,
      );
      // Act
      const [errorHandler] = statement.getErrorHandlers();
      const error = errorHandler({
        error: new DatabaseError('Error message', 0, 'error'),
        queryConfig: sql`SELECT 1`,
        args: {},
      });
      // Assert
      expect(error).toBe(mappedError);
    });

    it('should extends the error context with the error info', () => {
      // Arrange
      const errorMatcher = (): { code: string } => ({ code: 'error' });
      const statement: SqlStatement<
        object,
        QueryRunner.Result,
        DatabaseError | Error
      > = SqlStatement.from(() => sql`SELECT 1`).matchError(
        errorMatcher,
        (ctx) => new Error(ctx.code),
      );
      // Act
      const [errorHandler] = statement.getErrorHandlers();
      const error = errorHandler({
        error: new DatabaseError('Error message', 0, 'error'),
        queryConfig: sql`SELECT 1`,
        args: {},
      });
      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('error');
    });
  });

  describe('prepare', () => {
    it('should return a new SqlQuery instance', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const statement = SqlStatement.from(() => sql`SELECT 1`);
      // Act
      const query = statement.prepare(queryRunner);
      // Assert
      expect(query).toBeInstanceOf(SqlQuery);
    });

    it('should return a new SqlQuery instance with the same data processor', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const dataProcessor = (): number => 1;
      const statement = SqlStatement.from(() => sql`SELECT 1`).processData(
        dataProcessor,
      );
      // Act
      const query = statement.prepare(queryRunner);
      // Assert
      expect(query.getDataProcessor()).toBeDefined();
    });

    it('should return a new SqlQuery instance with the same error handlers', () => {
      // Arrange
      const queryRunner = mock<QueryRunner>();
      const errorMatcher = (): boolean => false;
      const statement = SqlStatement.from(() => sql`SELECT 1`).matchError(
        errorMatcher,
        () => new Error('Error message'),
      );
      // Act
      const query = statement.prepare(queryRunner);
      // Assert
      expect(query.getErrorHandlers()).toHaveLength(1);
    });
  });
});
