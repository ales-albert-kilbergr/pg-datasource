import {
  CreateSchema,
  DropSchema,
  DropTable,
  SchemaExists,
  SelectColumnType,
  TableExists,
} from '@kilbergr/pg-sql';
import { SqlStatement } from './sql-statement';
import { pickFirstRecord, mapToColumn } from '../data-processors';

export const CreateSchemaStatement =
  SqlStatement.from(CreateSchema).processResultToVoid();

export const DropSchemaStatement =
  SqlStatement.from(DropSchema).processResultToVoid();

export const DropTableStatement =
  SqlStatement.from(DropTable).processResultToVoid();

export const SchemaExistsStatement = SqlStatement.from(
  SchemaExists,
).processDataFlow(mapToColumn<boolean>('exists'), pickFirstRecord());

export const SelectColumnTypeStatement = SqlStatement.from(
  SelectColumnType,
).processDataFlow(mapToColumn<string>('data_type'), pickFirstRecord());

export const TableExistsStatement = SqlStatement.from(
  TableExists,
).processDataFlow(mapToColumn<boolean>('exists'), pickFirstRecord());
