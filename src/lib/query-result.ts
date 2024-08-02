import type { QueryConfig } from '@kilbergr/pg-sql';
import { QueryStats } from './query-stats';
import type { QueryResult as PgQueryResult, QueryResultRow } from 'pg';

export class QueryResult<R extends QueryResultRow = QueryResultRow> {
  /**
   * Query execution statistics.
   */
  public stats = new QueryStats();
  /**
   * The original query config which was used to execute the query
   */
  public config!: QueryConfig;
  /**
   * The query actual result. It can be anything, depending of what query
   * mappers and reducers were used. By default it will be the raw result
   * from the database.
   */
  public result!: PgQueryResult<R>;

  public constructor(queryConfig: QueryConfig) {
    this.config = queryConfig;
  }
}
