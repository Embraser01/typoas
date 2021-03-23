import { createClient } from './generator/api/client';
import { Context } from './context';
import { OpenAPIObject, SchemasObject } from 'openapi3-ts';
import {
  factory,
  NodeFlags,
  SourceFile,
  Statement,
  SyntaxKind,
} from 'typescript';
import { IMPORT_RUNTIME } from './generator/utils/ref';
import { createTypeFromSchema } from './generator/components/schemas';
import { sanitizeTypeIdentifier } from './generator/utils/operation-name';
import { createAuthMethodsFactory } from './generator/api/security';

export function createSchemaComponents(
  schemas: SchemasObject,
  ctx: Context,
): Statement[] {
  return Object.entries(schemas).map(([key, schema]) =>
    factory.createTypeAliasDeclaration(
      undefined,
      [factory.createModifier(SyntaxKind.ExportKeyword)],
      factory.createIdentifier(sanitizeTypeIdentifier(key)),
      undefined,
      createTypeFromSchema(schema, ctx),
    ),
  );
}

export function generateClient(specs: OpenAPIObject, name: string): SourceFile {
  const ctx = new Context();

  if (specs.components) {
    ctx.initComponents(specs.components);
  }

  const clientClass = createClient(specs, name, ctx);
  const schemaStmts = specs.components?.schemas
    ? createSchemaComponents(specs.components?.schemas, ctx)
    : [];

  return factory.createSourceFile(
    [
      factory.createImportDeclaration(
        undefined,
        undefined,
        factory.createImportClause(
          false,
          undefined,
          factory.createNamespaceImport(
            factory.createIdentifier(IMPORT_RUNTIME),
          ),
        ),
        factory.createStringLiteral('@typoas/runtime', true),
      ),
      ...schemaStmts,
      ...createAuthMethodsFactory(specs.components?.securitySchemes || {}, ctx),
      clientClass,
    ],
    factory.createToken(SyntaxKind.EndOfFileToken),
    NodeFlags.Const,
  );
}
