import { Cascade, IfExists, Identifier, sql } from '@kilbergr/pg-sql';
import { InvalidQueryArgError } from '../invalid-query-arg-error';
import * as E from 'fp-ts/lib/Either';
import type { DatabaseError } from 'pg';
import type { QueryRunner } from '../../query-runner';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace DropTableQuery {
  export type ValueErrorCode =
    (typeof DropTableQuery.VALUE_ERROR_CODE)[keyof typeof DropTableQuery.VALUE_ERROR_CODE];

  export type Result = E.Either<
    DatabaseError | InvalidQueryArgError<ValueErrorCode>,
    void
  >;
}

export class DropTableQuery {
  public static readonly VALUE_ERROR_CODE = {
    ERR_MISSING_TABLE_NAME: 'ERR_MISSING_TABLE_NAME',
    ERR_MISSING_TABLE_SCHEMA: 'ERR_MISSING_TABLE_SCHEMA',
  } as const;

  private readonly queryRunner: QueryRunner;

  private _tableName?: string;

  private _tableSchema?: string;

  private _cascade = false;

  private _ifExists = false;

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

  public cascade(): boolean;
  public cascade(cascade: boolean): this;
  public cascade(cascade?: boolean): boolean | this {
    if (cascade === undefined) {
      return this._cascade;
    }

    this._cascade = cascade;

    return this;
  }

  public ifExists(): boolean;
  public ifExists(ifExists: boolean): this;
  public ifExists(ifExists?: boolean): boolean | this {
    if (ifExists === undefined) {
      return this._ifExists;
    }

    this._ifExists = ifExists;

    return this;
  }

  public async execute(): Promise<DropTableQuery.Result> {
    if (this._tableName === undefined) {
      return E.left(
        InvalidQueryArgError.IsRequired(
          DropTableQuery.VALUE_ERROR_CODE.ERR_MISSING_TABLE_NAME,
          'tableName',
        ),
      );
    }

    if (this._tableSchema === undefined) {
      return E.left(
        InvalidQueryArgError.IsRequired(
          DropTableQuery.VALUE_ERROR_CODE.ERR_MISSING_TABLE_SCHEMA,
          'tableSchema',
        ),
      );
    }

    const queryConfig = sql`
      DROP TABLE ${IfExists(this._ifExists)} 
        ${Identifier(`${this.tableSchema()}.${this.tableName()}`)}
        ${Cascade(this._cascade)};
    `;

    const result = await this.queryRunner.query(queryConfig);

    if (E.isLeft(result)) {
      return result;
    }

    return E.right(void 0);
  }
}
