import type { QueryConfig } from '@kilbergr/pg-sql';
import type { QueryRunner } from '../query-runner';
import type { DatabaseError, QueryResultRow } from 'pg';
import { SqlQuery } from './sql-query';
import { reduceToVoid } from '../data-processors';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace SqlStatement {
  /**
   * The error matcher is a function which takes a context of a query failure
   * with the original database error and decides if the database error is to
   * be handled by an attached error handler. If the error matcher returns
   * a truthy value, the error handler is called with the same context.
   *
   * If the returned truthy value is an object, it is passed to the error
   * handler as an additional context called ERROR_INFO. If the returned value
   * is a boolean, the error handler is called without any additional context.
   * If the returned value is null or undefined, the error handler is not called.
   */
  export type ErrorMatcher<ARGS extends object, ERROR_INFO extends object> = (
    ctx: SqlQuery.ErrorContext<ARGS>,
  ) => ERROR_INFO | boolean | null | undefined;

  export type CtxAndErrorInfoUnion<
    ARGS extends object,
    ERROR_INFO extends object | boolean | null | undefined,
  > = SqlQuery.ErrorContext<ARGS> &
    (ERROR_INFO extends object ? ERROR_INFO : never);
}

export class SqlStatement<
  ARGS extends object,
  DATA = QueryRunner.Result,
  ERROR = DatabaseError,
> {
  private dataProcessor?: SqlQuery.DataProcessorFn<ARGS, DATA>;

  private readonly errorHandlers: SqlQuery.ErrorHandler<ARGS, ERROR>[] = [];

  private readonly queryConfigBuilder: SqlQuery.QueryConfigBuilder<ARGS>;

  public constructor(queryConfigBuilder: SqlQuery.QueryConfigBuilder<ARGS>) {
    this.queryConfigBuilder = queryConfigBuilder;
  }

  public static from<
    ARGS extends object,
    RESULT = QueryRunner.Result,
    PROCESSED_ERROR = DatabaseError,
  >(
    queryConfigBuilder: (args: ARGS) => QueryConfig,
  ): SqlStatement<ARGS, RESULT, PROCESSED_ERROR> {
    return new SqlStatement<ARGS, RESULT, PROCESSED_ERROR>(queryConfigBuilder);
  }

  public processData<NEW_DATA = QueryRunner.Result>(
    processDataFn: SqlQuery.DataProcessorFn<ARGS, NEW_DATA>,
  ): SqlStatement<ARGS, NEW_DATA, ERROR> {
    const self = this as unknown as SqlStatement<ARGS, NEW_DATA, ERROR>;

    self.dataProcessor = processDataFn;

    return self;
  }

  public getDataProcessor(): SqlQuery.DataProcessorFn<ARGS, DATA> | undefined {
    return this.dataProcessor;
  }

  public processResultToVoid(): SqlStatement<ARGS, void, ERROR> {
    return this.processDataFlow(reduceToVoid());
  }

  public processDataFlow<A>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.DataProcessorContext<ARGS>) => A,
  ): SqlStatement<ARGS, A, ERROR>;
  public processDataFlow<A, B>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.DataProcessorContext<ARGS>) => A,
    fn2: (a: A, ctx: SqlQuery.DataProcessorContext<ARGS>) => B,
  ): SqlStatement<ARGS, B, ERROR>;
  public processDataFlow<A, B, C>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.DataProcessorContext<ARGS>) => A,
    fn2: (a: A, ctx: SqlQuery.DataProcessorContext<ARGS>) => B,
    fn3: (a: B, ctx: SqlQuery.DataProcessorContext<ARGS>) => C,
  ): SqlStatement<ARGS, C, ERROR>;
  public processDataFlow<A, B, C, D>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.DataProcessorContext<ARGS>) => A,
    fn2: (a: A, ctx: SqlQuery.DataProcessorContext<ARGS>) => B,
    fn3: (a: B, ctx: SqlQuery.DataProcessorContext<ARGS>) => C,
    fn4: (a: C, ctx: SqlQuery.DataProcessorContext<ARGS>) => D,
  ): SqlStatement<ARGS, D, ERROR>;
  public processDataFlow<A, B, C, D, E>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.DataProcessorContext<ARGS>) => A,
    fn2: (a: A, ctx: SqlQuery.DataProcessorContext<ARGS>) => B,
    fn3: (a: B, ctx: SqlQuery.DataProcessorContext<ARGS>) => C,
    fn4: (a: C, ctx: SqlQuery.DataProcessorContext<ARGS>) => D,
    fn5: (a: D, ctx: SqlQuery.DataProcessorContext<ARGS>) => E,
  ): SqlStatement<ARGS, E, ERROR>;
  public processDataFlow<A, B, C, D, E, F>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.DataProcessorContext<ARGS>) => A,
    fn2: (a: A, ctx: SqlQuery.DataProcessorContext<ARGS>) => B,
    fn3: (a: B, ctx: SqlQuery.DataProcessorContext<ARGS>) => C,
    fn4: (a: C, ctx: SqlQuery.DataProcessorContext<ARGS>) => D,
    fn5: (a: D, ctx: SqlQuery.DataProcessorContext<ARGS>) => E,
    fn6: (a: E, ctx: SqlQuery.DataProcessorContext<ARGS>) => F,
  ): SqlStatement<ARGS, F, ERROR>;
  public processDataFlow<A, B, C, D, E, F, G>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.DataProcessorContext<ARGS>) => A,
    fn2: (a: A, ctx: SqlQuery.DataProcessorContext<ARGS>) => B,
    fn3: (a: B, ctx: SqlQuery.DataProcessorContext<ARGS>) => C,
    fn4: (a: C, ctx: SqlQuery.DataProcessorContext<ARGS>) => D,
    fn5: (a: D, ctx: SqlQuery.DataProcessorContext<ARGS>) => E,
    fn6: (a: E, ctx: SqlQuery.DataProcessorContext<ARGS>) => F,
    fn7: (a: F, ctx: SqlQuery.DataProcessorContext<ARGS>) => G,
  ): SqlStatement<ARGS, G, ERROR>;
  public processDataFlow<A, B, C, D, E, F, G, H>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.DataProcessorContext<ARGS>) => A,
    fn2: (a: A, ctx: SqlQuery.DataProcessorContext<ARGS>) => B,
    fn3: (a: B, ctx: SqlQuery.DataProcessorContext<ARGS>) => C,
    fn4: (a: C, ctx: SqlQuery.DataProcessorContext<ARGS>) => D,
    fn5: (a: D, ctx: SqlQuery.DataProcessorContext<ARGS>) => E,
    fn6: (a: E, ctx: SqlQuery.DataProcessorContext<ARGS>) => F,
    fn7: (a: F, ctx: SqlQuery.DataProcessorContext<ARGS>) => G,
    fn8: (a: G, ctx: SqlQuery.DataProcessorContext<ARGS>) => H,
  ): SqlStatement<ARGS, H, ERROR>;
  public processDataFlow<A, B, C, D, E, F, G, H, I>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.DataProcessorContext<ARGS>) => A,
    fn2: (a: A, ctx: SqlQuery.DataProcessorContext<ARGS>) => B,
    fn3: (a: B, ctx: SqlQuery.DataProcessorContext<ARGS>) => C,
    fn4: (a: C, ctx: SqlQuery.DataProcessorContext<ARGS>) => D,
    fn5: (a: D, ctx: SqlQuery.DataProcessorContext<ARGS>) => E,
    fn6: (a: E, ctx: SqlQuery.DataProcessorContext<ARGS>) => F,
    fn7: (a: F, ctx: SqlQuery.DataProcessorContext<ARGS>) => G,
    fn8: (a: G, ctx: SqlQuery.DataProcessorContext<ARGS>) => H,
    fn9: (a: H, ctx: SqlQuery.DataProcessorContext<ARGS>) => I,
  ): SqlStatement<ARGS, I, ERROR>;
  public processDataFlow<A, B, C, D, E, F, G, H, I, J>(
    fn1: (a: QueryResultRow[], ctx: SqlQuery.DataProcessorContext<ARGS>) => A,
    fn2: (a: A, ctx: SqlQuery.DataProcessorContext<ARGS>) => B,
    fn3: (a: B, ctx: SqlQuery.DataProcessorContext<ARGS>) => C,
    fn4: (a: C, ctx: SqlQuery.DataProcessorContext<ARGS>) => D,
    fn5: (a: D, ctx: SqlQuery.DataProcessorContext<ARGS>) => E,
    fn6: (a: E, ctx: SqlQuery.DataProcessorContext<ARGS>) => F,
    fn7: (a: F, ctx: SqlQuery.DataProcessorContext<ARGS>) => G,
    fn8: (a: G, ctx: SqlQuery.DataProcessorContext<ARGS>) => H,
    fn9: (a: H, ctx: SqlQuery.DataProcessorContext<ARGS>) => I,
    fn10: (a: I, ctx: SqlQuery.DataProcessorContext<ARGS>) => J,
  ): SqlStatement<ARGS, J, ERROR>;
  public processDataFlow<NEW_RESULT = QueryRunner.Result>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...fns: ((a: any, ctx: SqlQuery.DataProcessorContext<ARGS>) => any)[]
  ): SqlStatement<ARGS, NEW_RESULT, ERROR> {
    return this.processData<NEW_RESULT>(
      (ctx: SqlQuery.DataProcessorContext<ARGS>) =>
        fns.reduce(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          (acc, fn) => fn(acc, ctx),
          ctx.queryResult.rows,
        ) as NEW_RESULT,
    );
  }

  public matchError<ERROR_INFO extends object, NEW_ERROR>(
    matcher: SqlStatement.ErrorMatcher<ARGS, ERROR_INFO>,
    handler: (ctx: SqlQuery.ErrorContext<ARGS> & ERROR_INFO) => NEW_ERROR,
  ): SqlStatement<ARGS, DATA, SqlQuery.ErrorUnion<ERROR, NEW_ERROR>> {
    const self = this as unknown as SqlStatement<
      ARGS,
      DATA,
      SqlQuery.ErrorUnion<ERROR, NEW_ERROR>
    >;

    const errorHandler: SqlQuery.ErrorHandler<ARGS, NEW_ERROR> = (
      ctx: SqlQuery.ErrorContext<ARGS>,
    ): NEW_ERROR | undefined => {
      const errorInfo = matcher(ctx);
      if (
        errorInfo !== null &&
        errorInfo !== false &&
        errorInfo !== undefined
      ) {
        const extendedArgs =
          typeof errorInfo === 'object' ? { ...ctx, ...errorInfo } : ctx;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return handler(extendedArgs as any);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    self.errorHandlers.push(errorHandler as any);

    return self;
  }

  public getErrorHandlers(): SqlQuery.ErrorHandler<ARGS, ERROR>[] {
    return this.errorHandlers;
  }

  public prepare(queryRunner: QueryRunner): SqlQuery<ARGS, DATA, ERROR> {
    const query = new SqlQuery<ARGS, DATA, ERROR>(
      queryRunner,
      this.queryConfigBuilder,
    );

    if (this.dataProcessor) {
      query.setDataProcessor(this.dataProcessor);
    }

    if (this.errorHandlers.length > 0) {
      this.errorHandlers.forEach((errorProcessor) => {
        query.addErrorHandler(errorProcessor);
      });
    }

    return query;
  }
}
