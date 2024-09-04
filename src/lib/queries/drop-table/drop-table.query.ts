import { Cascade, IfExists, Identifier, sql } from '@kilbergr/pg-sql';
import {
  processResultToVoid,
  type SqlQuery,
  SqlStatement,
} from '../sql-statement';
import * as Joi from 'joi';
import type { DropTableArgs } from './drop-table.types';

export const build: SqlQuery.QueryConfigBuilder<DropTableArgs> = (args) => {
  return sql`
    DROP TABLE ${IfExists(args.ifExists ?? false)} 
      ${Identifier(`${args.tableSchema}.${args.tableName}`)}
      ${Cascade(args.cascade ?? false)};
  `;
};

const COMMON_MESSAGE_PREFIX =
  'Statement "DropTableQuery" failed to prepare query for dropping a table.';

const argsSchema = Joi.object<DropTableArgs>({
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
  cascade: Joi.boolean().optional(),
  ifExists: Joi.boolean().optional(),
});

export const DropTableQuery = SqlStatement.create({
  argsSchema,
  build,
  processResult: processResultToVoid,
});
