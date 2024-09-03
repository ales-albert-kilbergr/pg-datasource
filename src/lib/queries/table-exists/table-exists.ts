import { sql } from '@kilbergr/pg-sql';
import type { QueryRunner } from '../../query-runner';
import * as E from 'fp-ts/lib/Either';
import type { DatabaseError } from 'pg';
import { InvalidQueryArgError } from '../invalid-query-arg-error';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace TableExistsQuery {
  export type ValueErrorCode =
    (typeof TableExistsQuery.VALUE_ERROR_CODE)[keyof typeof TableExistsQuery.VALUE_ERROR_CODE];

  export type Result = E.Either<
    DatabaseError | InvalidQueryArgError<ValueErrorCode>,
    boolean
  >;
}

export class TableExistsQuery {
  public static readonly VALUE_ERROR_CODE = {
    ERR_MISSING_TABLE_NAME: 'ERR_MISSING_TABLE_NAME',
    ERR_MISSING_TABLE_SCHEMA: 'ERR_MISSING_TABLE_SCHEMA',
  } as const;

  private readonly queryRunner: QueryRunner;

  private _tableName?: string;

  private _tableSchema?: string;

  public constructor(queryRunner: QueryRunner) {
    this.queryRunner = queryRunner;
  }

  public tableName(tableName: string): this;
  public tableName(): string | undefined;
  public tableName(tableName?: string): this | string | undefined {
    if (tableName === undefined) {
      return this._tableName;
    }

    this._tableName = tableName;

    return this;
  }

  public tableSchema(tableSchema: string): this;
  public tableSchema(): string | undefined;
  public tableSchema(tableSchema?: string): this | string | undefined {
    if (tableSchema === undefined) {
      return this._tableSchema;
    }

    this._tableSchema = tableSchema;

    return this;
  }

  public async execute(): Promise<TableExistsQuery.Result> {
    if (this._tableName === undefined) {
      return E.left(
        InvalidQueryArgError.IsRequired(
          TableExistsQuery.VALUE_ERROR_CODE.ERR_MISSING_TABLE_NAME,
          'tableName',
        ),
      );
    }

    if (this._tableSchema === undefined) {
      return E.left(
        InvalidQueryArgError.IsRequired(
          TableExistsQuery.VALUE_ERROR_CODE.ERR_MISSING_TABLE_SCHEMA,
          'tableSchema',
        ),
      );
    }

    const queryConfig = sql`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = :${this._tableSchema}
        AND table_name = :${this._tableName}
      ) as "exists";
    `;

    const result = await this.queryRunner.query(queryConfig);

    if (E.isRight(result)) {
      return E.right(result.right.rows[0].exists);
    } else {
      return result;
    }
  }
}
