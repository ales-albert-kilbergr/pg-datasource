export class QueryStats {
  /**
   * Time it took the runner to obtain an available database client. Time
   * is given in milliseconds. If missing the query failed to obtain a
   * client.
   */
  public connectionDuration = 0;
  /**
   * Time it took the runner to execute the query. Time is given in
   * milliseconds. If missing the query failed to execute.
   */
  public executionDuration = 0;
  /**
   * Time it took the runner to process the query. Time is given in
   * milliseconds. If missing the query failed to process.
   */
  public processingDuration = 0;
  /**
   * The number of processed rows.
   */
  public rowCount = 0;

  public get totalDuration(): number {
    return (
      this.connectionDuration + this.executionDuration + this.processingDuration
    );
  }
}
