import type { QueryConfig } from '@kilbergr/pg-sql';
import type { QueryRunner } from '../query-runner';
import * as E from 'fp-ts/lib/Either';
import type { DatabaseError } from 'pg';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace SqlQuery {
  /**
   * This is a context object passed to each data processor alongside with
   * the result of the previous data processor. It contains the query result,
   * query configuration and query arguments used to build it.
   */
  export interface DataProcessorContext<ARGS = object> {
    /**
     * The query result returned by the query runner.
     */
    queryResult: QueryRunner.Result;
    /**
     * The query configuration used to run the query.
     */
    queryConfig: QueryConfig;
    /**
     * The query arguments used to run the query.
     */
    args: ARGS;
  }
  /**
   * A data processor is a callback function that takes a context of query result,
   * query config and query arguments and returns a processed data. It can be
   * used to transform the raw query result into a more structured data or to
   * reduce rows to a single value.
   */
  export type DataProcessorFn<ARGS extends object, DATA> = (
    ctx: DataProcessorContext<ARGS>,
  ) => DATA;
  /**
   * This is a context object passed to each error processor. It contains
   * the query configuration and query arguments used to build it.
   */
  export interface ErrorContext<ARGS extends object> {
    /**
     * The error returned by the query runner.
     */
    error: DatabaseError;
    /**
     * The query configuration used to run the query.
     */
    queryConfig: QueryConfig;
    /**
     * The query arguments used to run the query.
     */
    args: ARGS;
  }

  export type ErrorHandler<ARGS extends object, ERROR = DatabaseError> = (
    ctx: ErrorContext<ARGS>,
  ) => ERROR | undefined;

  export type DatabaseErrorMapperFn<
    ARGS extends object,
    PROCESSED_ERROR,
    ERROR_INFO extends object,
  > = (ctx: ErrorContext<ARGS> & ERROR_INFO) => PROCESSED_ERROR;

  export type DatabaseErrorProcessorFn<ARGS extends object, PROCESSED_ERROR> = (
    ctx: ErrorContext<ARGS>,
  ) => PROCESSED_ERROR;

  export type QueryConfigBuilder<ARGS extends object> = (
    args: ARGS,
  ) => QueryConfig;
  /**
   * An union which only extends the original set of errors with a new one if
   * the new error is not null or undefined.
   */
  export type ErrorUnion<ORIG_ERROR, NEW_ERROR> = NEW_ERROR extends undefined
    ? ORIG_ERROR
    : NEW_ERROR extends null
      ? ORIG_ERROR
      : NEW_ERROR extends boolean
        ? ORIG_ERROR
        : ORIG_ERROR | NEW_ERROR;
}

export class SqlQuery<
  ARGS extends object,
  DATA = QueryRunner.Result,
  ERROR = DatabaseError,
> {
  private readonly queryRunner: QueryRunner;

  private args: ARGS = {} as ARGS;

  private dataProcessor?: SqlQuery.DataProcessorFn<ARGS, DATA>;

  private readonly errorHandlers: SqlQuery.ErrorHandler<ARGS, ERROR>[] = [];

  private readonly queryConfigBuilder: SqlQuery.QueryConfigBuilder<ARGS>;
  /**
   *
   * @param queryRunner - The query runner to use to execute the query.
   * @param builder     - The query configuration builder to use to build
   *                      the query configuration.
   */
  public constructor(
    queryRunner: QueryRunner,
    builder: SqlQuery.QueryConfigBuilder<ARGS>,
  ) {
    this.queryRunner = queryRunner;
    this.queryConfigBuilder = builder;
  }

  public setDataProcessor<OVERRIDE_DATA>(
    dataProcessor: SqlQuery.DataProcessorFn<ARGS, OVERRIDE_DATA>,
  ): SqlQuery<ARGS, OVERRIDE_DATA, ERROR> {
    const self = this as unknown as SqlQuery<ARGS, OVERRIDE_DATA, ERROR>;

    self.dataProcessor = dataProcessor;

    return self;
  }

  public getDataProcessor(): SqlQuery.DataProcessorFn<ARGS, DATA> | undefined {
    return this.dataProcessor;
  }
  /**
   * Add an error handler to the query. Error handlers are called in the order
   * they were added until one of them returns a non-null value. If all error handlers
   * return null, the database error is returned as is, otherwise the first non-null
   * value is returned. The best practice is to return another more specific error
   * instead of the database error.
   *
   * @param errorHandler
   * @returns
   */
  public addErrorHandler<NEW_ERROR>(
    errorHandler: SqlQuery.ErrorHandler<ARGS, NEW_ERROR>,
  ): SqlQuery<ARGS, DATA, SqlQuery.ErrorUnion<ERROR, NEW_ERROR>> {
    const self = this as unknown as SqlQuery<
      ARGS,
      DATA,
      SqlQuery.ErrorUnion<ERROR, NEW_ERROR>
    >;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    self.errorHandlers.push(errorHandler as any);

    return self;
  }

  public getErrorHandlers(): SqlQuery.ErrorHandler<ARGS, ERROR>[] {
    return this.errorHandlers;
  }

  public setArgs(args: ARGS): this {
    this.args = args;

    return this;
  }

  public getArgs(): ARGS {
    return this.args;
  }

  public setArg<K extends keyof ARGS>(key: K, value: ARGS[K]): this {
    this.args[key] = value;

    return this;
  }

  public getArg<K extends keyof ARGS>(key: K): ARGS[K] {
    return this.args[key];
  }

  public getQueryConfig(): QueryConfig {
    return this.queryConfigBuilder(this.args);
  }

  public async execute(): Promise<E.Either<DatabaseError | ERROR, DATA>> {
    const queryConfig = this.queryConfigBuilder(this.args);

    const queryResult = await this.queryRunner.query(queryConfig);

    if (E.isRight(queryResult)) {
      if (this.dataProcessor) {
        return E.right(
          this.dataProcessor({
            queryResult: queryResult.right,
            queryConfig,
            args: this.args,
          }),
        );
      }

      return queryResult as E.Right<DATA>;
    } else {
      if (this.errorHandlers.length > 0) {
        for (const errorProcessor of this.errorHandlers) {
          const processedError = errorProcessor({
            error: queryResult.left,
            queryConfig,
            args: this.args,
          });

          if (
            processedError !== null &&
            processedError !== undefined &&
            processedError !== false
          ) {
            return E.left(processedError);
          }
        }
      }

      return queryResult as E.Left<ERROR>;
    }
  }
}
