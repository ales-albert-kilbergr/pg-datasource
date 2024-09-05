import { type QueryConfig, sql } from '@kilbergr/pg-sql';
import {
  pickFirstRecord,
  processResultFlow,
  reduceToColumn,
  SqlStatement,
} from '../sql-statement';
import type { SchemaExistsArgs } from './schema-exists.types';

export function build(args: SchemaExistsArgs): QueryConfig {
  const queryConfig = sql`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.schemata
      WHERE schema_name = :${args.schema}
    ) as "exists";
  `;

  return queryConfig;
}

export const SchemaExistsQuery = SqlStatement.create({
  build,
  processResult: processResultFlow(
    reduceToColumn<boolean>('exists'),
    pickFirstRecord(),
  ),
});
