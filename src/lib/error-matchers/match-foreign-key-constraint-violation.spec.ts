import { DatabaseError } from 'pg';
import type { SqlQuery } from '../statements';
import { mock } from 'jest-mock-extended';
import type { QueryConfig } from '@kilbergr/pg-sql';
import { matchForeignKeyConstraintViolation } from './match-foreign-key-constraint-violation';

describe('(Unit) matchForeignKeyConstraintViolation', () => {
  it('should extract the key and value for the foreign key constraint violation', () => {
    // Arrange
    const constraint = 'my_constraint';
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'my_constraint';
    error.code = '23503';
    error.detail = 'Key (id)=(event_store_id_5PseERABKl) already exists.';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchForeignKeyConstraintViolation(constraint)(ctx);
    // Assert
    expect(result).toMatchObject({
      conflict: { id: 'event_store_id_5PseERABKl' },
    });
  });

  it('should extract the key and value for the foreign key constraint violation with multiple keys', () => {
    // Arrange
    const constraint = 'my_constraint';
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'my_constraint';
    error.code = '23503';
    error.detail =
      'Key (id, name)=(event_store_id_5PseERABKl, event_store_name) already exists.';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchForeignKeyConstraintViolation(constraint)(ctx);
    // Assert
    expect(result).toEqual({
      conflict: {
        id: 'event_store_id_5PseERABKl',
        name: 'event_store_name',
      },
    });
  });

  it('should not extract the key and value for a different constraint violation', () => {
    // Arrange
    const constraint = 'my_constraint';
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'different_constraint';
    error.code = '23503';
    error.detail = 'Key (id)=(event_store_id_5PseERABKl) already exists.';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchForeignKeyConstraintViolation(constraint)(ctx);
    // Assert
    expect(result).toBe(false);
  });

  it('should return false if the error is not a constraint violation', () => {
    // Arrange
    const constraint = 'my_constraint';
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'my_constraint';
    error.code = '23504';
    error.detail = 'Key (id)=(event_store_id_5PseERABKl) already exists.';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchForeignKeyConstraintViolation(constraint)(ctx);
    // Assert
    expect(result).toBe(false);
  });

  it('should return false if the error detail is not in the expected format', () => {
    // Arrange
    const constraint = 'my_constraint';
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'my_constraint';
    error.code = '23503';
    error.detail = 'test message';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchForeignKeyConstraintViolation(constraint)(ctx);
    // Assert
    expect(result).toBe(false);
  });

  it('should return false if the error detail does not start with "Key"', () => {
    // Arrange
    const constraint = 'my_constraint';
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'my_constraint';
    error.code = '23503';
    error.detail = 'Invalid format';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchForeignKeyConstraintViolation(constraint)(ctx);
    // Assert
    expect(result).toBe(false);
  });

  it('should return false if the error detail is missing', () => {
    // Arrange
    const constraint = 'my_constraint';
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'my_constraint';
    error.code = '23503';
    error.detail = undefined;
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchForeignKeyConstraintViolation(constraint)(ctx);
    // Assert
    expect(result).toBe(false);
  });
});
