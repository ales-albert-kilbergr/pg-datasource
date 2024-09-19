import {
  CreateSchema,
  DropSchema,
  DropTable,
  SchemaExists,
  SelectColumnType,
  TableExists,
} from '@kilbergr/pg-sql';
import { SqlStatement } from './sql-statement';
import { pickFirstRecord, reduceToColumn } from './result-processors';

export const CreateSchemaQuery =
  SqlStatement.from(CreateSchema).processResultToVoid();

export const DropSchemaQuery =
  SqlStatement.from(DropSchema).processResultToVoid();

export const DropTableQuery =
  SqlStatement.from(DropTable).processResultToVoid();

export const SchemaExistsQuery = SqlStatement.from(
  SchemaExists,
).processResultFlow(reduceToColumn<boolean>('exists'), pickFirstRecord());

export const SelectColumnTypeQuery = SqlStatement.from(
  SelectColumnType,
).processResultFlow(reduceToColumn<string>('data_type'), pickFirstRecord());

export const TableExistsQuery = SqlStatement.from(
  TableExists,
).processResultFlow(reduceToColumn<boolean>('exists'), pickFirstRecord());
