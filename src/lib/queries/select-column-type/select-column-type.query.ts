import { sql } from '@kilbergr/pg-sql';
import * as Joi from 'joi';
import {
  processToFirstRowField,
  SqlStatement,
  type SqlQuery,
} from '../sql-statement';
import type { SelectColumnTypeArgs } from './select-column-type.types';

// Export for testing only
export const build: SqlQuery.QueryConfigBuilder<SelectColumnTypeArgs> =
  function (args) {
    return sql`
    SELECT data_type 
    FROM information_schema.columns WHERE 
      table_schema = :${args.tableSchema} AND
      table_name = :${args.tableName} AND 
      column_name = :${args.columnName};
  `;
  };

const COMMON_MESSAGE_PREFIX =
  'Statement "SelectColumnTypeQuery" failed to prepare a query ' +
  'for column data type.';

const argsSchema = Joi.object<SelectColumnTypeArgs>({
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
  columnName: Joi.string()
    .required()
    .messages({
      'any.required': `${COMMON_MESSAGE_PREFIX} Column name not set.`,
    }),
});

export const SelectColumnTypeQuery = SqlStatement.create({
  argsSchema,
  build,
  processResult: processToFirstRowField<string>('data_type'),
});
