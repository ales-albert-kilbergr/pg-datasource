import type { QueryRunner } from './query-runner';

export class Repository<C = unknown> {
  protected queryRunner: QueryRunner;

  protected readonly config: C;

  public constructor(queryRunner: QueryRunner, config: C) {
    this.queryRunner = queryRunner;
    this.config = config;
  }
}
