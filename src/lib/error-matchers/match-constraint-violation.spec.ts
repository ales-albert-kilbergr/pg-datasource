import { DatabaseError } from 'pg';
import { matchConstraintViolationError } from './match-constraint-violation';
import type { SqlQuery } from '../statements';
import { mock } from 'jest-mock-extended';
import type { QueryConfig } from '@kilbergr/pg-sql';

describe('(Unit) matchConstraintViolationError', () => {
  it('should catch a specific constraint violation error', () => {
    // Arrange
    const constraint = 'my_constraint';
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'my_constraint';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchConstraintViolationError(constraint)(ctx);
    // Assert
    expect(result).toBe(true);
  });

  it('should catch a constraint violation error by regex', () => {
    // Arrange
    const constraint = /^my_constraint/;
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'my_constraint_1';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchConstraintViolationError(constraint)(ctx);
    // Assert
    expect(result).toBe(true);
  });

  it('should not catch a different constraint violation error', () => {
    // Arrange
    const constraint = 'my_constraint';
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'different_constraint';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchConstraintViolationError(constraint)(ctx);
    // Assert
    expect(result).toBe(false);
  });

  it('should not catch a constraint violation error with regex', () => {
    // Arrange
    const constraint = /^my_constraint/;
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'different_constraint';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchConstraintViolationError(constraint)(ctx);
    // Assert
    expect(result).toBe(false);
  });

  it('should return false if the error is missing a constraint', () => {
    // Arrange
    const constraint = /my_constraint/;
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = undefined;
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchConstraintViolationError(constraint)(ctx);
    // Assert
    expect(result).toBe(false);
  });
});
