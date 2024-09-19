import type { QueryConfig } from '@kilbergr/pg-sql';
import type { QueryRunner } from '../query-runner';
import type { ObjectSchema } from 'joi';
import type { DatabaseError, QueryResultRow } from 'pg';
import { SqlQuery } from './sql-query';
import { processResultFlow, reduceToVoid } from './result-processors';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace SqlStatement {
  export interface Options<
    ARGS extends object,
    RESULT = QueryRunner.Result,
    PROCESSED_ERROR = DatabaseError,
  > {
    argsSchema?: ObjectSchema<ARGS>;
    build: (args: ARGS) => QueryConfig;
    processResult?: SqlQuery.ResultProcessorFn<ARGS, RESULT>;
    processError?: SqlQuery.DatabaseErrorProcessorFn<ARGS, PROCESSED_ERROR>;
  }
}

export class SqlStatement<
  ARGS extends object,
  RESULT = QueryRunner.Result,
  PROCESSED_ERROR = DatabaseError,
> {
  private readonly options: SqlStatement.Options<ARGS, RESULT, PROCESSED_ERROR>;

  public constructor(
    options: SqlStatement.Options<ARGS, RESULT, PROCESSED_ERROR>,
  ) {
    this.options = options;
  }

  public static from<
    ARGS extends object,
    RESULT = QueryRunner.Result,
    PROCESSED_ERROR = DatabaseError,
  >(
    queryConfigBuilder: (args: ARGS) => QueryConfig,
  ): SqlStatement<ARGS, RESULT, PROCESSED_ERROR> {
    return new SqlStatement<ARGS, RESULT, PROCESSED_ERROR>({
      build: queryConfigBuilder,
    });
  }

  public processResult<NEW_RESULT = QueryRunner.Result>(
    processResultFn: SqlQuery.ResultProcessorFn<ARGS, NEW_RESULT>,
  ): SqlStatement<ARGS, NEW_RESULT, PROCESSED_ERROR> {
    this.options.processResult =
      processResultFn as unknown as SqlQuery.ResultProcessorFn<ARGS, RESULT>;

    return this as unknown as SqlStatement<ARGS, NEW_RESULT, PROCESSED_ERROR>;
  }

  public processError<NEW_ERROR = DatabaseError>(
    processErrorFn: SqlQuery.DatabaseErrorProcessorFn<ARGS, NEW_ERROR>,
  ): SqlStatement<ARGS, RESULT, NEW_ERROR> {
    this.options.processError =
      processErrorFn as unknown as SqlQuery.DatabaseErrorProcessorFn<
        ARGS,
        PROCESSED_ERROR
      >;

    return this as unknown as SqlStatement<ARGS, RESULT, NEW_ERROR>;
  }

  public processResultToVoid(): SqlStatement<ARGS, void, PROCESSED_ERROR> {
    return this.processResultFlow(reduceToVoid());
  }

  public processResultFlow<A>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
  ): SqlStatement<ARGS, A, PROCESSED_ERROR>;
  public processResultFlow<A, B>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
    fn2: (a: A, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => B,
  ): SqlStatement<ARGS, B, PROCESSED_ERROR>;
  public processResultFlow<A, B, C>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
    fn2: (a: A, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => B,
    fn3: (a: B, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => C,
  ): SqlStatement<ARGS, C, PROCESSED_ERROR>;
  public processResultFlow<A, B, C, D>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
    fn2: (a: A, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => B,
    fn3: (a: B, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => C,
    fn4: (a: C, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => D,
  ): SqlStatement<ARGS, D, PROCESSED_ERROR>;
  public processResultFlow<A, B, C, D, E>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
    fn2: (a: A, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => B,
    fn3: (a: B, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => C,
    fn4: (a: C, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => D,
    fn5: (a: D, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => E,
  ): SqlStatement<ARGS, E, PROCESSED_ERROR>;
  public processResultFlow<A, B, C, D, E, F>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
    fn2: (a: A, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => B,
    fn3: (a: B, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => C,
    fn4: (a: C, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => D,
    fn5: (a: D, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => E,
    fn6: (a: E, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => F,
  ): SqlStatement<ARGS, F, PROCESSED_ERROR>;
  public processResultFlow<A, B, C, D, E, F, G>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
    fn2: (a: A, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => B,
    fn3: (a: B, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => C,
    fn4: (a: C, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => D,
    fn5: (a: D, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => E,
    fn6: (a: E, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => F,
    fn7: (a: F, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => G,
  ): SqlStatement<ARGS, G, PROCESSED_ERROR>;
  public processResultFlow<A, B, C, D, E, F, G, H>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
    fn2: (a: A, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => B,
    fn3: (a: B, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => C,
    fn4: (a: C, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => D,
    fn5: (a: D, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => E,
    fn6: (a: E, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => F,
    fn7: (a: F, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => G,
    fn8: (a: G, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => H,
  ): SqlStatement<ARGS, H, PROCESSED_ERROR>;
  public processResultFlow<A, B, C, D, E, F, G, H, I>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.ResultProcessorArgs<ARGS>) => A,
    fn2: (a: A, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => B,
    fn3: (a: B, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => C,
    fn4: (a: C, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => D,
    fn5: (a: D, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => E,
    fn6: (a: E, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => F,
    fn7: (a: F, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => G,
    fn8: (a: G, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => H,
    fn9: (a: H, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => I,
  ): SqlStatement<ARGS, I, PROCESSED_ERROR>;
  public processResultFlow<A, B, C, D, E, F, G, H, I, J>(
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
  ): SqlStatement<ARGS, J, PROCESSED_ERROR>;
  public processResultFlow<NEW_RESULT = QueryRunner.Result>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...fns: ((a: any, ctx: SqlQuery.ResultProcessorArgs<ARGS>) => any)[]
  ): SqlStatement<ARGS, NEW_RESULT, PROCESSED_ERROR> {
    return this.processResult<NEW_RESULT>(
      Reflect.apply(processResultFlow, null, fns),
    );
  }

  public prepare(
    queryRunner: QueryRunner,
  ): SqlQuery<ARGS, RESULT, PROCESSED_ERROR> {
    const query = new SqlQuery<ARGS, RESULT, PROCESSED_ERROR>(
      queryRunner,
      this.options,
    );

    return query;
  }
}
