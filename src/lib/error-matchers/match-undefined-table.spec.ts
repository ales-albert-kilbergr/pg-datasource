import { DatabaseError } from 'pg';
import { matchUndefinedTableError } from './match-undefined-table';
import type { SqlQuery } from '../statements';
import type { QueryConfig } from '@kilbergr/pg-sql';
import { mock } from 'jest-mock-extended';

describe('(Unit) matchUndefinedTable', () => {
  it('should extract the missing table name', () => {
    // Arrange
    const error = new DatabaseError(
      'relation "my_table" does not exist',
      0,
      'error',
    );
    error.code = '42P01';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchUndefinedTableError()(ctx);
    // Assert
    expect(result).toEqual({ table: 'my_table' });
  });

  it('should return false if the error is of different code', () => {
    // Arrange
    const error = new DatabaseError(
      'relation "my_table" does not exist',
      0,
      'error',
    );
    error.code = '42P02';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchUndefinedTableError()(ctx);
    // Assert
    expect(result).toBe(false);
  });

  it('should return false if the error message does not match the pattern', () => {
    // Arrange
    const error = new DatabaseError('test message', 0, 'error');
    error.code = '42P01';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchUndefinedTableError()(ctx);
    // Assert
    expect(result).toEqual(false);
  });
});
