import { sql } from '@kilbergr/pg-sql';
import * as Joi from 'joi';
import {
  processToFirstRowField,
  type SqlQuery,
  SqlStatement,
} from '../sql-statement';
import type { TableExistsArgs } from './table-exists.types';

export const build: SqlQuery.QueryConfigBuilder<TableExistsArgs> = (args) => {
  const queryConfig = sql`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = :${args.tableSchema}
      AND table_name = :${args.tableName}
    ) as "exists";
  `;

  return queryConfig;
};

const COMMON_MESSAGE_PREFIX =
  'Statement "TableExistsQuery" failed to prepare query for checking if a table exists.';

const argsSchema = Joi.object<TableExistsArgs>({
  tableName: Joi.string()
    .required()
    .messages({
      'any.required': `${COMMON_MESSAGE_PREFIX} Table name not set.`,
    }),
  tableSchema: Joi.string()
    .required()
    .messages({
      'any.required': `${COMMON_MESSAGE_PREFIX} Table schema not set.`,
    }),
});

export const TableExistsQuery = SqlStatement.create({
  argsSchema,
  build,
  processResult: processToFirstRowField<boolean>('exists'),
});
