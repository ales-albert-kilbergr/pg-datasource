import {
  Identifier,
  IfNotExists,
  SchemaAuthorization,
  sql,
  type QueryConfig,
} from '@kilbergr/pg-sql';
import type { CreateSchemaArgs } from './create-schema.args';
import {
  processResultFlow,
  reduceToVoid,
  SqlStatement,
} from '../sql-statement';

export function build(args: CreateSchemaArgs): QueryConfig {
  return sql`
    CREATE SCHEMA 
      ${IfNotExists(args.ifNotExists)}
      ${Identifier(args.schema)} 
      ${SchemaAuthorization(args.authorization)};
  `;
}

export const CreateSchemaQuery = SqlStatement.create({
  build,
  processResult: processResultFlow(reduceToVoid()),
});
