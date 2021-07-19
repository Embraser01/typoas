import { createClient } from './generator/api/client';
import { Context, ContextOptions } from './context';
import { OpenAPIObject, SchemasObject } from 'openapi3-ts';
import {
  factory,
  NodeFlags,
  SourceFile,
  Statement,
  SyntaxKind,
} from 'typescript';
import { addJSDocToNode } from './generator/comments/fields';
import { getJSDocFromSchema } from './generator/comments/schema';
import { IMPORT_RUNTIME } from './generator/utils/ref';
import { createTypeFromSchema } from './generator/components/schemas';
import { sanitizeTypeIdentifier } from './generator/utils/operation-name';
import { createAuthMethodsFactory } from './generator/api/security';

export function createSchemaComponents(
  schemas: SchemasObject,
  ctx: Context,
): Statement[] {
  return Object.entries(schemas).map(([key, schema]) => {
    const typeAlias = factory.createTypeAliasDeclaration(
      undefined,
      [factory.createModifier(SyntaxKind.ExportKeyword)],
      factory.createIdentifier(sanitizeTypeIdentifier(key)),
      undefined,
      createTypeFromSchema(schema, ctx),
    );

    if (ctx.hasJSDoc()) {
      addJSDocToNode(typeAlias, getJSDocFromSchema(schema));
    }

    return typeAlias;
  });
}

export function generateClient(
  specs: OpenAPIObject,
  name: string,
  opts?: ContextOptions,
): SourceFile {
  const ctx = new Context(opts);

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
