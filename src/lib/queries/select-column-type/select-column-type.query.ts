import { type QueryConfig, sql } from '@kilbergr/pg-sql';
import {
  pickFirstRow,
  processResultFlow,
  reduceToColumn,
  SqlStatement,
} from '../sql-statement';
import type { SelectColumnTypeArgs } from './select-column-type.types';

// Export for testing only
export function build(args: SelectColumnTypeArgs): QueryConfig {
  return sql`
    SELECT data_type 
    FROM information_schema.columns WHERE 
      table_schema = :${args.schema} AND
      table_name = :${args.table} AND 
      column_name = :${args.column};
  `;
}

export const SelectColumnTypeQuery = SqlStatement.create({
  build,
  processResult: processResultFlow(
    reduceToColumn<string>('data_type'),
    pickFirstRow(),
  ),
});
