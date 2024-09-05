import {
  Cascade,
  Identifier,
  IfExists,
  sql,
  type QueryConfig,
} from '@kilbergr/pg-sql';
import type { DropSchemaArgs } from './drop-schema.types';
import { processResultToVoid, SqlStatement } from '../sql-statement';

export function build(args: DropSchemaArgs): QueryConfig {
  return sql`
    DROP SCHEMA ${IfExists(args.ifExists)} 
      ${Identifier(args.schema)}
      ${Cascade(args.cascade)};
  `;
}

export const DropSchemaQuery = SqlStatement.create({
  build,
  processResult: processResultToVoid,
});
