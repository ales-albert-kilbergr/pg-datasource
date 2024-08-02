import { DatabaseError, type QueryResultRow } from 'pg';
import { catchError, map, of, type OperatorFunction } from 'rxjs';
import { QueryResult } from './query-result';
import type { Class } from 'type-fest';
import { plainToInstance, type ClassTransformOptions } from 'class-transformer';

function toCamelCase(str: string): string {
  return str.replace(/([-_][a-z])/gi, (match) => {
    return match.toUpperCase().replace('-', '').replace('_', '');
  });
}

export function transformKeysToCamelCase<
  R extends QueryResultRow,
>(): OperatorFunction<QueryResult | QueryResultRow[], R[]> {
  return map((input: QueryResult | QueryResultRow[]): R[] => {
    const rows = Array.isArray(input) ? input : input.result.rows;

    return rows.map((row) =>
      Object.keys(row).reduce((acc, key) => {
        (acc as QueryResultRow)[toCamelCase(key)] = row[key];
        return acc;
      }, {}),
    ) as R[];
  });
}

export function transformToInstance<T>(
  Constructor: Class<T>,
  options?: ClassTransformOptions,
): OperatorFunction<QueryResult | QueryResultRow[], T | T[]> {
  return map(
    (
      input: QueryResult | QueryResultRow[] | QueryResultRow | null | undefined,
    ): T | T[] => {
      if (input === undefined || input === null) return input as unknown as T;
      if (Array.isArray(input)) {
        return (
          input.length > 0 ? plainToInstance(Constructor, input, options) : []
        ) as T[];
      } else if (input instanceof QueryResult) {
        return (
          Array.isArray(input.result.rows) && input.result.rows.length > 0
            ? plainToInstance(Constructor, input.result.rows, options)
            : []
        ) as T[];
      } else if (typeof input === 'object') {
        return plainToInstance(Constructor, input, options) as T;
      } else {
        throw new TypeError(
          `Cannot transform ${typeof input} into ${Constructor.name}! ` +
            `Expected an object or array of objects, but received ${typeof input}`,
        );
      }
    },
  );
}

export type DatabaseErrorHandler<R = unknown> = (
  error: DatabaseError,
) => Error | R | Promise<Error | R>;

export function catchDatabaseError<R>(
  code: string,
  catchFn: DatabaseErrorHandler<R>,
): ReturnType<typeof catchError> {
  return catchError((error: unknown) => {
    if (error instanceof DatabaseError && error.code === code) {
      const result = catchFn(error);

      if (result instanceof Error) {
        throw result;
      } else {
        return of(result);
      }
    }
    throw error;
  });
}

export type DuplicateTableErrorHandler<R = unknown> = (
  duplicatedTable: string,
  error: DatabaseError,
) => ReturnType<DatabaseErrorHandler<R>>;
/**
 * Catch a duplicate sequence or table error
 *
 * Example of an error:
 *
 * error: relation "my_test_table" already exists
 *      at /Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/node_modules/pg/lib/client.js:526:17
 *      at processTicksAndRejections (node:internal/process/task_queues:95:5)
 *      at async QueryRunner.query (/Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/libs/db/pg-datasource/src/lib/services/query-runner/query-runner.service.ts:96:27)
 *      at async QueryHandler.execute (/Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/libs/db/pg-datasource/src/lib/services/query-handler/query-handler.service.ts:114:27)
 *      at async EventSequenceRepository.create (/Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/libs/ese/event-store/src/lib/repositories/event-sequence/event-sequence.repository.ts:32:5)
 *      at async Object.<anonymous> (/Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/libs/ese/event-store/src/lib/repositories/event-sequence/event-sequence.repository.spec.ts:43:7) {
 *    length: 123,
 *    severity: 'ERROR',
 *    code: '42P07',
 *    detail: undefined,
 *    hint: undefined,
 *    position: undefined,
 *    internalPosition: undefined,
 *    internalQuery: undefined,
 *    where: undefined,
 *    schema: undefined,
 *    table: undefined,
 *    column: undefined,
 *    dataType: undefined,
 *    constraint: undefined,
 *    file: 'heap.c',
 *    line: '1146',
 *    routine: 'heap_create_with_catalog'
 *  }
 *
 * {@link https://www.postgresql.org/docs/current/errcodes-appendix.html}
 */
export function catchDuplicateTableError(
  catchFn: DuplicateTableErrorHandler,
): ReturnType<typeof catchDatabaseError> {
  return catchDatabaseError('42P07', (error: DatabaseError): unknown => {
    const match = /relation "(?<table>.*?)" already exists/.exec(error.message);
    const table = match?.groups?.table ?? '';

    return catchFn(table, error);
  });
}

export type UndefinedTableErrorHandler<R = unknown> = (
  missingTable: string,
  error: DatabaseError,
) => ReturnType<DatabaseErrorHandler<R>>;
/**
 * Catch a an error when a table does not exists "42P01"
 *
 * error: relation "event_store.event_store_or1linox" does not exist
 *      at /Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/node_modules/pg/lib/client.js:526:17
 *      at processTicksAndRejections (node:internal/process/task_queues:95:5)
 *      at async QueryRunner.query (/Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/libs/db/pg-datasource/src/lib/services/query-runner/query-runner.service.ts:96:27)
 *      at async QueryHandler.execute (/Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/libs/db/pg-datasource/src/lib/services/query-handler/query-handler.service.ts:115:27)
 *      at async EventPartitionRepository.create (/Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/libs/ese/event-store/src/lib/repositories/event-partition/event-partition.repository.ts:36:5)
 *      at async Object.<anonymous> (/Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/libs/ese/event-store/src/lib/repositories/event-partition/event-partition.repository.spec.ts:63:7) {
 *    length: 130,
 *    severity: 'ERROR',
 *    code: '42P01',
 *    detail: undefined,
 *    hint: undefined,
 *    position: undefined,
 *    internalPosition: undefined,
 *    internalQuery: undefined,
 *    where: undefined,
 *    schema: undefined,
 *    table: undefined,
 *    column: undefined,
 *    dataType: undefined,
 *    constraint: undefined,
 *    file: 'namespace.c',
 *    line: '429',
 *    routine: 'RangeVarGetRelidExtended'
 *  }
 */
export function catchUndefinedTableError<R = unknown>(
  catchFn: UndefinedTableErrorHandler<R>,
): ReturnType<typeof catchDatabaseError> {
  return catchDatabaseError('42P01', (error: DatabaseError): unknown => {
    const match = /relation "(?<table>.*?)" does not exist/.exec(error.message);
    const table = match?.groups?.table ?? '';

    return catchFn(table, error);
  });
}

// TO BE REFACTORED ---
/*
function extractConflict<C extends object>(errorDetail: string): C {
  // We want to parse a map object where key is the conflicting
  // column and value is the conflicting value from the error detail.
  // Example of an error detail can be:
  //   Key (id)=(event_store_id_5PseERABKl) already exists.

  const match = /Key \((?<keys>.*?)\)=\((?<values>.*?)\)/.exec(errorDetail);

  const conflict: C = {} as C;

  if (match?.groups) {
    const { keys, values } = match.groups;

    const keysArray = keys
      .split(',')
      .map((key) => StringUtils.toCamelCase(key.trim()));
    const valuesArray = values.split(',').map((value) => value.trim());

    for (let i = 0; i < keysArray.length; i++) {
      conflict[keysArray[i]] = valuesArray[i];
    }
  }

  return conflict;
}

export function catchUniqueConstraintViolationError<C extends object>(
  constraint: string | RegExp,
  catchFn: (
    conflict: C,
    error: DatabaseError,
    queryConfig: QueryConfig,
  ) => unknown,
): ReturnType<typeof catchConstraintViolationError> {
  return catchConstraintViolationError(
    constraint,
    (error: DatabaseError, queryConfig: QueryConfig): unknown => {
      if (error.code === '23505') {
        return catchFn(extractConflict(error.detail ?? ''), error, queryConfig);
      }
      return void 0;
    },
  );
}
\/**
 *
 * @param constraint
 * @param catchFn
 * @returns
 *
 * Error example:
 *
 * error: insert or update on table "event_aggregate" violates foreign key constraint "fk_event_aggregate_store_table"
 *       at /Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/node_modules/pg/lib/client.js:526:17
 *       at processTicksAndRejections (node:internal/process/task_queues:95:5)
 *      at async QueryRunner.query (/Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/libs/db/pg-datasource/src/lib/services/query-runner/query-runner.service.ts:96:27)
 *      at async QueryHandler.execute (/Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/libs/db/pg-datasource/src/lib/services/query-handler/query-handler.service.ts:115:27)
 *      at async EventAggregateRepository.insert (/Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/libs/ese/event-store/src/lib/repositories/event-aggregate/event-aggregate.repository.ts:24:25)
 *      at async Object.<anonymous> (/Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/libs/ese/event-store/src/lib/repositories/event-aggregate/event-aggregate.repository.spec.ts:95:7) {
 *    length: 305,
 *    severity: 'ERROR',
 *    code: '23503',
 *    detail: 'Key (store_id)=(nzvmeg3t) is not present in table "event_store".',
 *    hint: undefined,
 *    position: undefined,
 *    internalPosition: undefined,
 *    internalQuery: undefined,
 *    where: undefined,
 *    schema: 'event_store',
 *    table: 'event_aggregate',
 *    column: undefined,
 *    dataType: undefined,
 *    constraint: 'fk_event_aggregate_store_table',
 *    file: 'ri_triggers.c',
 *    line: '2608',
 *    routine: 'ri_ReportViolation'
 *  }
 * /
export function catchForeignKeyConstraintViolationError<C extends object>(
  constraint: string,
  catchFn: (
    conflict: C,
    error: DatabaseError,
    queryConfig: QueryConfig,
  ) => unknown,
): ReturnType<typeof catchConstraintViolationError> {
  return catchConstraintViolationError(
    constraint,
    (error: DatabaseError, queryConfig: QueryConfig): unknown => {
      if (error.code === '23503') {
        return catchFn(extractConflict(error.detail ?? ''), error, queryConfig);
      }
      return void 0;
    },
  );
}

export function DoNothing(): null {
  return null;
}
/**
 * Catch a missing partition error
 *
 * error: no partition of relation "event_store_hsd230rg" found for row
 *      at /Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/node_modules/pg/lib/client.js:526:17
 *      at processTicksAndRejections (node:internal/process/task_queues:95:5)
 *      at async QueryRunner.query (/Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/libs/db/pg-datasource/src/lib/services/query-runner/query-runner.service.ts:96:27)
 *      at async QueryHandler.execute (/Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/libs/db/pg-datasource/src/lib/services/query-handler/query-handler.service.ts:114:27)
 *      at async EventRepository.insert (/Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/libs/ese/event-store/src/lib/repositories/event/event.repository.ts:185:25)
 *      at async Object.<anonymous> (/Users/alesalbertkilbergr/Development/Fulfin/Core/core-event-store/libs/ese/event-store/src/lib/repositories/event/event.repository.spec.ts:187:7) {
 *    length: 239,
 *    severity: 'ERROR',
 *    code: '23514',
 *    detail: 'Partition key of the failing row contains (aggregate_type) = (UxJobaAa).',
 *    hint: undefined,
 *    position: undefined,
 *    internalPosition: undefined,
 *    internalQuery: undefined,
 *    where: undefined,
 *    schema: 'event_store',
 *    table: 'event_store_hsd230rg',
 *    column: undefined,
 *    dataType: undefined,
 *    constraint: undefined,
 *    file: 'execPartition.c',
 *    line: '328',
 *    routine: 'ExecFindPartition'
 *  }
 * /
export function catchMissingPartitionError<C extends object>(
  catchFn: (
    partition: C,
    error: DatabaseError,
    queryConfig: QueryConfig,
  ) => unknown,
) {
  return (error: Error, queryConfig: QueryConfig): unknown => {
    if (
      error instanceof DatabaseError &&
      error.code === '23514' &&
      typeof error.detail === 'string' &&
      error.detail.includes('Partition key of the failing')
    ) {
      const match =
        /Partition key of the failing row contains \((?<keys>.*?)\) = \((?<values>.*?)\)/.exec(
          error.detail,
        );
      const partitionKeys = (match?.groups?.keys ?? '')
        .split(',')
        .map((key) => StringUtils.toCamelCase(key.trim()));
      const partitionIds = (match?.groups?.values ?? '')
        .split(',')
        .map((value) => value.trim());

      const partition = partitionKeys.reduce((acc, key, index) => {
        acc[key] = partitionIds[index];
        return acc as C;
      }, {}) as C;

      return catchFn(partition, error, queryConfig);
    }
    return void 0;
  };
}

/*
export function catchDuplicateSchemaError(
  catchFn: QueryErrorHandler<DatabaseError>,
): ReturnType<typeof catchDatabaseError> {
  return catchDatabaseError('42P06', catchFn);
}

export function catchInvalidSchemaNameError(
  catchFn: QueryErrorHandler<DatabaseError>,
): ReturnType<typeof catchDatabaseError> {
  return catchDatabaseError('3F000', catchFn);
}

export function catchConstraintViolationError(
  constraint: string | RegExp,
  catchFn: QueryErrorHandler<DatabaseError>,
) {
  return (error: Error, queryConfig: QueryConfig): unknown => {
    if (
      error instanceof DatabaseError &&
      ((typeof constraint === 'string' && error.constraint === constraint) ||
        (constraint instanceof RegExp &&
          constraint.test(error.constraint ?? '')))
    ) {
      return catchFn(error, queryConfig);
    }
    return void 0;
  };
}
*/
