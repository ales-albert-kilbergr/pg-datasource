import { DatabaseError } from 'pg';
import type { SqlQuery } from '../statements';
import { mock } from 'jest-mock-extended';
import type { QueryConfig } from '@kilbergr/pg-sql';
import { matchDuplicateTableError } from './match-duplicate-table';

describe('(Unit) matchDuplicateTable', () => {
  it('should extract the table name for the duplicate table error', () => {
    // Arrange
    const error = new DatabaseError(
      'relation "my_table" already exists',
      0,
      'error',
    );
    error.code = '42P07';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchDuplicateTableError()(ctx);
    // Assert
    expect(result).toEqual({ table: 'my_table' });
  });

  it('should return false if the error is of different code', () => {
    // Arrange
    const error = new DatabaseError(
      'relation "my_table" already exists',
      0,
      'error',
    );
    error.code = '42P08';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchDuplicateTableError()(ctx);
    // Assert
    expect(result).toBe(false);
  });

  it('should return false if the error message does not match the pattern', () => {
    // Arrange
    const error = new DatabaseError('test message', 0, 'error');
    error.code = '42P07';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchDuplicateTableError()(ctx);
    // Assert
    expect(result).toEqual(false);
  });
});
