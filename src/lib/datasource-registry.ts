import type { Datasource } from './datasource';

export class DatasourceRegistry {
  private readonly map: Map<string, Datasource> = new Map<string, Datasource>();

  public constructor(datasource: Datasource[] = []) {
    this.register(...datasource);
  }

  public count(): number {
    return this.map.size;
  }

  public register(...datasource: Datasource[]): void {
    for (const ds of datasource) {
      this.map.set(ds.name, ds);
    }
  }

  public get(name: string): Datasource | undefined {
    return this.map.get(name);
  }

  public has(name: string): boolean {
    return this.map.has(name);
  }

  public delete(name: string): boolean {
    return this.map.delete(name);
  }

  public async destroyAll(): Promise<void> {
    for (const ds of this.map.values()) {
      await ds.destroy();
    }
  }
}
