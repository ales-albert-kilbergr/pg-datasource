import type { SqlQuery } from './sql-query';
import type { QueryResultRow } from 'pg';
import { toCamelCase } from '@kilbergr/string';
import type { Constructor } from 'type-fest';
import { plainToInstance } from 'class-transformer';

export function processResultFlow<ARGS extends object, A>(
  fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
): SqlQuery.ResultProcessorFn<ARGS, A>;
export function processResultFlow<ARGS extends object, A, B>(
  fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
  fn2: (a: A, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => B,
): SqlQuery.ResultProcessorFn<ARGS, B>;
export function processResultFlow<ARGS extends object, A, B, C>(
  fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
  fn2: (a: A, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => B,
  fn3: (a: B, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => C,
): SqlQuery.ResultProcessorFn<ARGS, C>;
export function processResultFlow<ARGS extends object, A, B, C, D>(
  fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
  fn2: (a: A, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => B,
  fn3: (a: B, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => C,
  fn4: (a: C, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => D,
): SqlQuery.ResultProcessorFn<ARGS, D>;
export function processResultFlow<ARGS extends object, A, B, C, D, E>(
  fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
  fn2: (a: A, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => B,
  fn3: (a: B, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => C,
  fn4: (a: C, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => D,
  fn5: (a: D, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => E,
): SqlQuery.ResultProcessorFn<ARGS, E>;
export function processResultFlow<ARGS extends object, A, B, C, D, E, F>(
  fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
  fn2: (a: A, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => B,
  fn3: (a: B, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => C,
  fn4: (a: C, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => D,
  fn5: (a: D, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => E,
  fn6: (a: E, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => F,
): SqlQuery.ResultProcessorFn<ARGS, F>;
export function processResultFlow<ARGS extends object, A, B, C, D, E, F, G>(
  fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
  fn2: (a: A, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => B,
  fn3: (a: B, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => C,
  fn4: (a: C, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => D,
  fn5: (a: D, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => E,
  fn6: (a: E, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => F,
  fn7: (a: F, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => G,
): SqlQuery.ResultProcessorFn<ARGS, G>;
export function processResultFlow<ARGS extends object, A, B, C, D, E, F, G, H>(
  fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
  fn2: (a: A, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => B,
  fn3: (a: B, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => C,
  fn4: (a: C, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => D,
  fn5: (a: D, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => E,
  fn6: (a: E, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => F,
  fn7: (a: F, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => G,
  fn8: (a: G, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => H,
): SqlQuery.ResultProcessorFn<ARGS, H>;
export function processResultFlow<
  ARGS extends object,
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
>(
  fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
  fn2: (a: A, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => B,
  fn3: (a: B, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => C,
  fn4: (a: C, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => D,
  fn5: (a: D, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => E,
  fn6: (a: E, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => F,
  fn7: (a: F, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => G,
  fn8: (a: G, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => H,
  fn9: (a: H, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => I,
): SqlQuery.ResultProcessorFn<ARGS, I>;
export function processResultFlow<
  ARGS extends object,
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
>(
  fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
  fn2: (a: A, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => B,
  fn3: (a: B, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => C,
  fn4: (a: C, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => D,
  fn5: (a: D, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => E,
  fn6: (a: E, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => F,
  fn7: (a: F, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => G,
  fn8: (a: G, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => H,
  fn9: (a: H, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => I,
  fn10: (a: I, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => J,
): SqlQuery.ResultProcessorFn<ARGS, J>;
export function processResultFlow<ARGS extends object, J>(
  ...fns: ((a: any, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => any)[]
): SqlQuery.ResultProcessorFn<ARGS, J> {
  return function processResult(ctx: SqlQuery.ResultProcessorArgs<ARGS>) {
    return fns.reduce((acc, fn) => fn(acc, ctx), ctx.queryResult.rows) as J;
  };
}

export function pickNthRecord<R = QueryResultRow>(index: number) {
  return (rows: R[]): R => rows[index];
}

export function pickFirstRecord<R = QueryResultRow>(): (rows: R[]) => R {
  return pickNthRecord(0);
}

export function transformColumnKeysToCamelCase() {
  return (rows: QueryResultRow[]): QueryResultRow[] => {
    return rows.map((row) => {
      const newRow: QueryResultRow = {};
      for (const key of Object.keys(row)) {
        newRow[toCamelCase(key)] = row[key];
      }
      return newRow;
    });
  };
}

export function transformRowToInstance<T>(ctor: Constructor<T>) {
  return (rows: QueryResultRow[]): T[] => {
    return plainToInstance(ctor, rows, {
      exposeDefaultValues: true,
    });
  };
}

export function reduceToVoid() {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return (): void => void 0;
}

export function reduceToColumn<R>(column: string) {
  return (rows: QueryResultRow[]): R[] => {
    return rows.map((row) => row[column] as R);
  };
}
