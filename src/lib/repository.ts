import type { QueryRunner } from './query-runner';

export class Repository {
  protected queryRunner: QueryRunner;

  public constructor(queryRunner: QueryRunner) {
    this.queryRunner = queryRunner;
  }
}
