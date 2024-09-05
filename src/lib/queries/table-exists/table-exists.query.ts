import { type QueryConfig, sql } from '@kilbergr/pg-sql';
import {
  pickFirstRecord,
  processResultFlow,
  reduceToColumn,
  SqlStatement,
} from '../sql-statement';
import type { TableExistsArgs } from './table-exists.types';

export function build(args: TableExistsArgs): QueryConfig {
  const queryConfig = sql`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = :${args.schema}
      AND table_name = :${args.table}
    ) as "exists";
  `;

  return queryConfig;
}

export const TableExistsQuery = SqlStatement.create({
  build,
  processResult: processResultFlow(
    reduceToColumn<boolean>('exists'),
    pickFirstRecord(),
  ),
});
