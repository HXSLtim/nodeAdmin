/** Shared types for the CRUD code generator. */

export interface ParsedColumn {
  /** TypeScript property name (camelCase), e.g. `tenantId` */
  propertyName: string;
  /** SQL column name (snake_case), e.g. `tenant_id` */
  sqlName: string;
  /** Drizzle type function name, e.g. `varchar`, `text`, `boolean`, `integer`, `timestamp`, `bigint` */
  drizzleType: string;
  /** Resolved TypeScript type, e.g. `string`, `boolean`, `number` */
  tsType: string;
  /** Max length for varchar columns */
  length?: number;
  isPrimary: boolean;
  isNullable: boolean;
  hasDefault: boolean;
  /** Has `.$defaultFn(() => ...)` — auto-generated value */
  hasDefaultFn: boolean;
  isUnique: boolean;
  /** True for id, createdAt, updatedAt, passwordHash, etc. */
  isAutoManaged: boolean;
}

export interface ParsedTable {
  /** The exported const name, e.g. `users` */
  exportName: string;
  /** SQL table name, e.g. `users` */
  sqlTableName: string;
  columns: ParsedColumn[];
  hasTenantId: boolean;
  /** Non-PK varchar/text columns suitable for ILIKE search */
  searchableColumns: string[];
}

export interface TypeMapping {
  tsType: string;
  /** Validator decorators for create DTO, e.g. `@IsString()` */
  validators: string[];
  /** class-validator import names, e.g. `['IsString']` */
  imports: string[];
  /** Extra import names from other packages, e.g. `['Type']` from class-transformer */
  extraImports: string[];
}

export interface GeneratorConfig {
  /** PascalCase singular, e.g. `Product` */
  entityName: string;
  /** camelCase singular, e.g. `product` */
  entityNameLower: string;
  /** Schema export name (plural camelCase), e.g. `products` */
  tableName: string;
  /** SQL table name */
  sqlTableName: string;
  hasTenantId: boolean;
  dryRun: boolean;
  force: boolean;
  noRegister: boolean;
  outputDir: string;
}

export interface TemplateContext {
  entityName: string;
  entityNameLower: string;
  tableName: string;
  sqlTableName: string;
  hasTenantId: boolean;
  searchableColumns: string[];
  allColumns: ParsedColumn[];
  createDtoColumns: ParsedColumn[];
  updateDtoColumns: ParsedColumn[];
  primaryKeys: string[];
  /** Columns shown in the data table (excludes id, tenantId, createdAt, updatedAt) */
  displayColumns: ParsedColumn[];
  /** Columns with boolean type (for special checkbox rendering) */
  booleanColumns: string[];
  /** Columns suitable for form fields (from createDto) */
  formColumns: ParsedColumn[];
}

export interface FrontendPaths {
  /** apps/adminPortal/src/components/business/ */
  businessDir: string;
  /** apps/adminPortal/src/i18n/locales/ */
  i18nDir: string;
  /** apps/adminPortal/src/app/layout/navConfig.ts */
  navConfigPath: string;
  /** apps/adminPortal/src/app/appRoot.tsx */
  appRootPath: string;
  /** packages/shared-types/src/index.ts */
  sharedTypesPath: string;
}
