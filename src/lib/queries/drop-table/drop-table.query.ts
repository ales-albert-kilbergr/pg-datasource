import {
  Cascade,
  IfExists,
  Identifier,
  sql,
  type QueryConfig,
} from '@kilbergr/pg-sql';
import { processResultToVoid, SqlStatement } from '../sql-statement';
import type { DropTableArgs } from './drop-table.types';

export function build(args: DropTableArgs): QueryConfig {
  return sql`
    DROP TABLE ${IfExists(args.ifExists)} 
      ${Identifier(`${args.schema}.${args.table}`)}
      ${Cascade(args.cascade)};
  `;
}

export const DropTableQuery = SqlStatement.create({
  build,
  processResult: processResultToVoid,
});
