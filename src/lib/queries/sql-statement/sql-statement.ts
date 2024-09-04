import type { QueryConfig } from '@kilbergr/pg-sql';
import type { QueryRunner } from '../../query-runner';
import type { ObjectSchema } from 'joi';
import type { DatabaseError } from 'pg';
import { SqlQuery } from './sql-query';

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

  public static create<
    ARGS extends object,
    RESULT = QueryRunner.Result,
    PROCESSED_ERROR = DatabaseError,
  >(
    options: SqlStatement.Options<ARGS, RESULT, PROCESSED_ERROR>,
  ): SqlStatement<ARGS, RESULT, PROCESSED_ERROR> {
    return new SqlStatement(options);
  }

  public prepare(
    queryRunner: QueryRunner,
    args: ARGS,
  ): SqlQuery<ARGS, RESULT, PROCESSED_ERROR> {
    const query = new SqlQuery<ARGS, RESULT, PROCESSED_ERROR>(
      queryRunner,
      this.options,
    ).setArgs(args);

    return query;
  }
}
