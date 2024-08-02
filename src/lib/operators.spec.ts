/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestScheduler } from 'rxjs/testing';
import { DatabaseError } from 'pg';
import {
  catchDatabaseError,
  catchDuplicateTableError,
  catchUndefinedTableError,
  transformKeysToCamelCase,
  transformToInstance,
} from './operators';
import { of, throwError } from 'rxjs';
import { QueryResult } from './query-result';
import { mock } from 'jest-mock-extended';
import type { QueryConfig } from '@kilbergr/pg-sql';

// https://medium.com/@bencabanes/marble-testing-observable-introduction-1f5ad39231c
describe('(Unit) Operators', () => {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let testScheduler: TestScheduler;

  describe('transformKeysToCamelCase', () => {
    beforeEach(() => {
      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
      });
    });

    it('should transform keys to camel case', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        const expectedMarbles = '(a|)';
        const input = [
          {
            first_name: 'John',
            last_name: 'Doe',
            email_address: 'john.doe@example.com',
          },
        ];
        const expectedOutput = [
          {
            firstName: 'John',
            lastName: 'Doe',
            emailAddress: 'john.doe@example.com',
          },
        ];
        // Act
        const result$ = of(input).pipe(transformKeysToCamelCase());
        // Assert
        expectObservable(result$).toBe(expectedMarbles, { a: expectedOutput });
      });
    });

    it('should transform keys to camel case for multiple objects', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        const expectedMarbles = '(a|)';
        const input = [
          {
            first_name: 'John',
            last_name: 'Doe',
            email_address: 'john.doe@example.com',
          },
          {
            first_name: 'Jane',
            last_name: 'Doe',
            email_address: 'jane.doe@example.com',
          },
        ];
        const expectedOutput = [
          {
            firstName: 'John',
            lastName: 'Doe',
            emailAddress: 'john.doe@example.com',
          },
          {
            firstName: 'Jane',
            lastName: 'Doe',
            emailAddress: 'jane.doe@example.com',
          },
        ];

        // Act
        const result$ = of(input).pipe(transformKeysToCamelCase());

        // Assert
        expectObservable(result$).toBe(expectedMarbles, { a: expectedOutput });
      });
    });

    it('should extract the object out of the query result structure', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        const expectedMarbles = '(a|)';
        const input = new QueryResult(mock<QueryConfig>());
        input.result = {
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
          rows: [
            {
              first_name: 'John',
              last_name: 'Doe',
              email_address: 'john.doe@example.com',
            },
          ],
        };
        const expectedOutput = [
          {
            firstName: 'John',
            lastName: 'Doe',
            emailAddress: 'john.doe@example.com',
          },
        ];

        // Act
        const result$ = of(input).pipe(transformKeysToCamelCase());

        // Assert
        expectObservable(result$).toBe(expectedMarbles, { a: expectedOutput });
      });
    });

    it('should ignore nested fields', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        const expectedMarbles = '(a|)';
        const input = [
          {
            first_name: 'John',
            last_name: 'Doe',
            email_address: 'john.doe@example.com',
            address: {
              street_address: '123 Main St',
              city: 'Anytown',
              state: 'NY',
              postal_code: '12345',
            },
          },
        ];
        const expectedOutput = [
          {
            firstName: 'John',
            lastName: 'Doe',
            emailAddress: 'john.doe@example.com',
            address: {
              street_address: '123 Main St',
              city: 'Anytown',
              state: 'NY',
              postal_code: '12345',
            },
          },
        ];

        // Act
        const result$ = of(input).pipe(transformKeysToCamelCase());
        // Assert
        expectObservable(result$).toBe(expectedMarbles, { a: expectedOutput });
      });
    });
  });

  describe('transformToInstance', () => {
    it('should transform a plain object to an instance of a class', () => {
      // Arrange
      class Person {
        public firstName!: string;
        public lastName!: string;
        public emailAddress!: string;
      }

      const input = [
        {
          firstName: 'John',
          lastName: 'Doe',
          emailAddress: 'john.doe@example.com',
        },
      ];

      const expectedOutput = new Person();
      expectedOutput.firstName = 'John';
      expectedOutput.lastName = 'Doe';
      expectedOutput.emailAddress = 'john.doe@example.com';

      // Act
      const result = of(input).pipe(transformToInstance(Person));
      // Assert
      result.subscribe((value: any) => {
        expect(value[0]).toBeInstanceOf(Person);
        expect(value[0]).toEqual(expectedOutput);
      });
    });

    it('should transform multiple plain objects to instances of a class', () => {
      // Arrange
      class Person {
        public firstName!: string;
        public lastName!: string;
        public emailAddress!: string;
      }

      const input = [
        {
          firstName: 'John',
          lastName: 'Doe',
          emailAddress: 'john.doe@example.com',
        },
        {
          firstName: 'Jane',
          lastName: 'Doe',
          emailAddress: 'jane.doe@example.com',
        },
      ];

      const expectedOutput1 = new Person();
      expectedOutput1.firstName = 'John';
      expectedOutput1.lastName = 'Doe';
      expectedOutput1.emailAddress = 'john.doe@example.com';

      const expectedOutput2 = new Person();
      expectedOutput2.firstName = 'Jane';
      expectedOutput2.lastName = 'Doe';
      expectedOutput2.emailAddress = 'jane.doe@example.com';

      // Act
      const result = of(input).pipe(transformToInstance(Person));
      // Assert
      result.subscribe((value: any) => {
        expect(value[0]).toBeInstanceOf(Person);
        expect(value[0]).toEqual(expectedOutput1);
        expect(value[1]).toBeInstanceOf(Person);
        expect(value[1]).toEqual(expectedOutput2);
      });
    });

    it('should extract the object out of the query result structure', () => {
      // Arrange
      class Person {
        public firstName!: string;
        public lastName!: string;
        public emailAddress!: string;
      }

      const input = new QueryResult(mock<QueryConfig>());
      input.result = {
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
        rows: [
          {
            firstName: 'John',
            lastName: 'Doe',
            emailAddress: 'john.doe@example.com',
          },
        ],
      };

      const expectedOutput = new Person();
      expectedOutput.firstName = 'John';
      expectedOutput.lastName = 'Doe';
      expectedOutput.emailAddress = 'john.doe@example.com';

      // Act
      const result = of(input).pipe(transformToInstance(Person));

      // Assert
      result.subscribe((value: any) => {
        expect(value[0]).toBeInstanceOf(Person);
        expect(value[0]).toEqual(expectedOutput);
      });
    });

    it('should extract multiple objects out of the query result structure', () => {
      // Arrange
      class Person {
        public firstName!: string;
        public lastName!: string;
        public emailAddress!: string;
      }

      const input = new QueryResult(mock<QueryConfig>());
      input.result = {
        command: 'SELECT',
        rowCount: 2,
        oid: 0,
        fields: [],
        rows: [
          {
            firstName: 'John',
            lastName: 'Doe',
            emailAddress: 'john.doe@example.com',
          },
          {
            firstName: 'Jane',
            lastName: 'Doe',
            emailAddress: 'jane.doe@example.com',
          },
        ],
      };

      const expectedOutput1 = new Person();
      expectedOutput1.firstName = 'John';
      expectedOutput1.lastName = 'Doe';
      expectedOutput1.emailAddress = 'john.doe@example.com';

      const expectedOutput2 = new Person();
      expectedOutput2.firstName = 'Jane';
      expectedOutput2.lastName = 'Doe';
      expectedOutput2.emailAddress = 'jane.doe@example.com';

      // Act
      const result = of(input).pipe(transformToInstance(Person));

      // Assert
      result.subscribe((value: any) => {
        expect(value[0]).toBeInstanceOf(Person);
        expect(value[0]).toEqual(expectedOutput1);
        expect(value[1]).toBeInstanceOf(Person);
        expect(value[1]).toEqual(expectedOutput2);
      });
    });

    it('should transform an object from a previous operator to an instance of a class', () => {
      // Arrange
      class Person {
        public firstName!: string;
        public lastName!: string;
        public emailAddress!: string;
      }
      const input = new QueryResult(mock<QueryConfig>());
      input.result = {
        command: 'SELECT',
        rowCount: 2,
        oid: 0,
        fields: [],
        rows: [
          {
            firstName: 'John',
            lastName: 'Doe',
            emailAddress: 'john.doe@example.com',
          },
          {
            firstName: 'Jane',
            lastName: 'Doe',
            emailAddress: 'jane.doe@example.com',
          },
        ],
      };

      const expectedOutput1 = new Person();
      expectedOutput1.firstName = 'John';
      expectedOutput1.lastName = 'Doe';
      expectedOutput1.emailAddress = 'john.doe@example.com';

      const expectedOutput2 = new Person();
      expectedOutput2.firstName = 'Jane';
      expectedOutput2.lastName = 'Doe';
      expectedOutput2.emailAddress = 'jane.doe@example.com';

      // Act
      const result = of(input).pipe(
        transformKeysToCamelCase(),
        transformToInstance(Person),
      );

      // Assert
      result.subscribe((value: any) => {
        expect(value[0]).toBeInstanceOf(Person);
        expect(value[0]).toEqual(expectedOutput1);
        expect(value[1]).toBeInstanceOf(Person);
        expect(value[1]).toEqual(expectedOutput2);
      });
    });
  });

  describe('catchDatabaseError', () => {
    beforeEach(() => {
      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
      });
    });

    it('should catch a DatabaseError with the specified code and return the result from catchFn', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will be caught and some result is
        // expected to be returned
        const expectedMarbles = '(a|)';
        const databaseErrorCode = '12345';

        const error = new DatabaseError('Random database error', 111, 'error');
        error.code = databaseErrorCode;
        const result = 'handled';

        // Act
        const result$ = throwError(() => error).pipe(
          catchDatabaseError(databaseErrorCode, () => result),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, { a: result });
      });
    });

    it('should not catch a DatabaseError with a different code', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will not be caught
        const expectedMarbles = '#';
        const databaseErrorCode = '12345';

        const error = new DatabaseError('Random database error', 111, 'error');
        error.code = '54321';

        // Act
        const result$ = throwError(() => error).pipe(
          catchDatabaseError(databaseErrorCode, () => 'handled'),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, null, error);
      });
    });

    it('should not catch an error that is not a DatabaseError', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will not be caught
        const expectedMarbles = '#';

        const error = new Error('Random error');

        // Act
        const result$ = throwError(() => error).pipe(
          catchDatabaseError('12345', () => 'handled'),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, null, error);
      });
    });

    it('should throw another error if the handler callback returns one', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will not be caught
        const expectedMarbles = '#';

        const databaseErrorCode = '12345';
        const error = new DatabaseError(
          'Random database error',
          111,
          'parseComplete',
        );
        error.code = databaseErrorCode;

        const handlerError = new Error('Handler error');

        // Act
        const result$ = throwError(() => error).pipe(
          catchDatabaseError(databaseErrorCode, () => handlerError),
        );

        // Assert
        expectObservable(result$).toBe(
          expectedMarbles,
          undefined,
          handlerError,
        );
      });
    });

    it('should rethrow an error throw by an error handler', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will not be caught
        const expectedMarbles = '#';

        const databaseErrorCode = '12345';
        const error = new DatabaseError('Random database error', 111, 'error');
        error.code = databaseErrorCode;

        const handlerError = new Error('Handler error');

        // Act
        const result$ = throwError(() => error).pipe(
          catchDatabaseError(databaseErrorCode, () => {
            throw handlerError;
          }),
        );

        // Assert
        expectObservable(result$).toBe(
          expectedMarbles,
          undefined,
          handlerError,
        );
      });
    });
  });

  describe('catchDuplicateTableError', () => {
    beforeEach(() => {
      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
      });
    });

    it('should catch a duplicate table error and return the result from catchFn', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will be caught and some result is
        // expected to be returned
        const expectedMarbles = '(a|)';

        const error = new DatabaseError(
          'relation "my_test_table" already exists',
          123,
          'error',
        );
        error.code = '42P07';
        const result = 'handled';

        // Act
        const result$ = throwError(() => error).pipe(
          catchDuplicateTableError(() => result),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, { a: result });
      });
    });

    it('should not catch a duplicate table error with a different code', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will not be caught
        const expectedMarbles = '#';

        const error = new DatabaseError('my other error', 123, 'error');
        error.code = '54321';

        // Act
        const result$ = throwError(() => error).pipe(
          catchDuplicateTableError(() => 'handled'),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, null, error);
      });
    });

    it('should pass the table name from the error to the catchFn', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will be caught and some result is
        // expected to be returned
        const expectedMarbles = '(a|)';

        const tableName = 'my_test_table';
        const error = new DatabaseError(
          `relation "${tableName}" already exists`,
          123,
          'error',
        );
        error.code = '42P07';

        // Act
        const result$ = throwError(() => error).pipe(
          catchDuplicateTableError((name) => name),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, { a: tableName });
      });
    });

    it('should catch the duplicate table error with non matching message', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will be caught and some result is
        // expected to be returned
        const expectedMarbles = '(a|)';

        const tableName = 'my_test_table';
        const error = new DatabaseError(
          `relation "${tableName}" already exists but with a different message`,
          123,
          'error',
        );
        error.code = '42P07';

        // Act
        const result$ = throwError(() => error).pipe(
          catchDuplicateTableError(() => 'handled'),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, { a: 'handled' });
      });
    });
  });

  describe('catchUndefinedTableError', () => {
    beforeEach(() => {
      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
      });
    });

    it('should catch an undefined table error and return the result from catchFn', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will be caught and some result is
        // expected to be returned
        const expectedMarbles = '(a|)';

        const error = new DatabaseError(
          'relation "my_test_table" does not exist',
          123,
          'error',
        );
        error.code = '42P01';
        const result = 'handled';

        // Act
        const result$ = throwError(() => error).pipe(
          catchUndefinedTableError(() => result),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, { a: result });
      });
    });

    it('should not catch an undefined table error with a different code', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will not be caught
        const expectedMarbles = '#';

        const error = new DatabaseError('my other error', 123, 'error');
        error.code = '54321';

        // Act
        const result$ = throwError(() => error).pipe(
          catchUndefinedTableError(() => 'handled'),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, null, error);
      });
    });

    it('should pass the table name from the error to the catchFn', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will be caught and some result is
        // expected to be returned
        const expectedMarbles = '(a|)';

        const tableName = 'my_test_table';
        const error = new DatabaseError(
          `relation "${tableName}" does not exist`,
          123,
          'error',
        );
        error.code = '42P01';

        // Act
        const result$ = throwError(() => error).pipe(
          catchUndefinedTableError((name) => name),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, { a: tableName });
      });
    });
  });
});
