import type { DatabaseError } from 'pg';
import { InvalidQueryArgError } from '../invalid-query-arg-error';
import type { QueryRunner } from '../../query-runner';
import * as E from 'fp-ts/lib/Either';
import { sql } from '@kilbergr/pg-sql';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace SelectColumnTypeQuery {
  export type ValueErrorCode =
    (typeof SelectColumnTypeQuery.VALUE_ERROR_CODE)[keyof typeof SelectColumnTypeQuery.VALUE_ERROR_CODE];

  export type Result = E.Either<
    DatabaseError | InvalidQueryArgError<ValueErrorCode>,
    string | undefined
  >;
}

export class SelectColumnTypeQuery {
  public static readonly VALUE_ERROR_CODE = {
    ERR_MISSING_TABLE_NAME: 'ERR_MISSING_TABLE_NAME',
    ERR_MISSING_TABLE_SCHEMA: 'ERR_MISSING_TABLE_SCHEMA',
    ERR_MISSING_COLUMN_NAME: 'ERR_MISSING_COLUMN_NAME',
  } as const;

  private readonly queryRunner: QueryRunner;

  private _tableName?: string;

  private _tableSchema?: string;

  private _columnName?: string;

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

  public columnName(columnName: string): this;
  public columnName(): string | undefined;
  public columnName(columnName?: string): this | string | undefined {
    if (columnName === undefined) {
      return this._columnName;
    }

    this._columnName = columnName;

    return this;
  }

  public async execute(): Promise<SelectColumnTypeQuery.Result> {
    if (this._tableName === undefined) {
      return E.left(
        InvalidQueryArgError.IsRequired(
          SelectColumnTypeQuery.VALUE_ERROR_CODE.ERR_MISSING_TABLE_NAME,
          'tableName',
        ),
      );
    }

    if (this._tableSchema === undefined) {
      return E.left(
        InvalidQueryArgError.IsRequired(
          SelectColumnTypeQuery.VALUE_ERROR_CODE.ERR_MISSING_TABLE_SCHEMA,
          'tableSchema',
        ),
      );
    }

    if (this._columnName === undefined) {
      return E.left(
        InvalidQueryArgError.IsRequired(
          SelectColumnTypeQuery.VALUE_ERROR_CODE.ERR_MISSING_COLUMN_NAME,
          'columnName',
        ),
      );
    }

    const queryConfig = sql`
      SELECT data_type 
      FROM information_schema.columns WHERE 
        table_schema = :${this._tableSchema} AND
        table_name = :${this._tableName} AND 
        column_name = :${this._columnName};
    `;

    const result = await this.queryRunner.query(queryConfig);

    if (E.isLeft(result)) {
      return result;
    }

    return E.right(result.right.rows[0].data_type);
  }
}
