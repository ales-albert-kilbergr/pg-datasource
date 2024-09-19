import type { QueryConfig } from '@kilbergr/pg-sql';
import type { QueryRunner } from '../query-runner';
import type { ValidationError, ObjectSchema } from 'joi';
import * as E from 'fp-ts/lib/Either';
import type { DatabaseError } from 'pg';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace SqlQuery {
  export type Error = unknown;

  export interface ResultProcessorArgs<ARGS = object> {
    queryResult: QueryRunner.Result;
    queryConfig: QueryConfig;
    args: ARGS;
  }

  export type ResultProcessorFn<ARGS extends object, RESULT> = (
    args: ResultProcessorArgs<ARGS>,
  ) => RESULT;

  export type DatabaseErrorProcessorFn<
    ARGS extends object,
    PROCESSED_ERROR,
  > = (args: {
    error: DatabaseError;
    queryConfig: QueryConfig;
    args: ARGS;
  }) => PROCESSED_ERROR;

  export type QueryConfigBuilder<ARGS extends object> = (
    args: ARGS,
  ) => QueryConfig;

  export interface Options<
    ARGS extends object,
    RESULT,
    PROCESSED_ERROR = DatabaseError,
  > {
    argsSchema?: ObjectSchema<ARGS>;
    build: QueryConfigBuilder<ARGS>;
    processResult?: ResultProcessorFn<ARGS, RESULT>;
    processDatabaseError?: DatabaseErrorProcessorFn<ARGS, PROCESSED_ERROR>;
  }
}

export class SqlQuery<
  ARGS extends object,
  RESULT,
  PROCESSED_ERROR = DatabaseError,
> {
  private readonly queryRunner: QueryRunner;

  private args: ARGS = {} as ARGS;

  private readonly options: SqlQuery.Options<ARGS, RESULT, PROCESSED_ERROR>;

  public constructor(
    queryRunner: QueryRunner,
    options: SqlQuery.Options<ARGS, RESULT, PROCESSED_ERROR>,
  ) {
    this.queryRunner = queryRunner;
    this.options = options;
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
    return this.options.build(this.args);
  }

  public async execute(): Promise<
    E.Either<DatabaseError | ValidationError | PROCESSED_ERROR, RESULT>
  > {
    if (this.options.argsSchema) {
      const { error } = this.options.argsSchema.validate(this.args);

      if (error) {
        return E.left(error);
      }
    }

    const queryConfig = this.options.build(this.args);

    const queryResult = await this.queryRunner.query(queryConfig);

    if (E.isLeft(queryResult)) {
      return this.options.processDatabaseError
        ? E.left(
            this.options.processDatabaseError({
              error: queryResult.left,
              queryConfig,
              args: this.args,
            }),
          )
        : queryResult;
    } else {
      return (
        this.options.processResult
          ? E.right(
              this.options.processResult({
                queryResult: queryResult.right,
                queryConfig,
                args: this.args,
              }),
            )
          : queryResult
      ) as E.Right<RESULT>;
    }
  }
}
