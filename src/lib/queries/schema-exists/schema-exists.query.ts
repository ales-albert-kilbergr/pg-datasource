import { sql } from '@kilbergr/pg-sql';
import {
  processToFirstRowField,
  SqlStatement,
  type SqlQuery,
} from '../sql-statement';
import type { SchemaExistsArgs } from './schema-exists.types';

export const build: SqlQuery.QueryConfigBuilder<SchemaExistsArgs> = (args) => {
  const queryConfig = sql`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.schemata
      WHERE schema_name = :${args.schema}
    ) as "exists";
  `;

  return queryConfig;
};

export const SchemaExistsQuery = SqlStatement.create({
  build,
  processResult: processToFirstRowField<boolean>('exists'),
});
