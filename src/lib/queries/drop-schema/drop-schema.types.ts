export interface DropSchemaArgs {
  schema: string;
  ifExists?: boolean;
  cascade?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type DropSchemaResult = void;
