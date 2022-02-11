import { createClient } from './generator/api/client';
import { Context, ContextOptions } from './context';
import { OpenAPIObject, SchemasObject } from 'openapi3-ts';
import {
  createPrinter,
  factory,
  NewLineKind,
  NodeFlags,
  SourceFile,
  Statement,
  SyntaxKind,
} from 'typescript';
import { addJSDocToNode } from './generator/comments/fields';
import { getJSDocFromSchema } from './generator/comments/schema';
import {
  canConvertSchemaToEnum,
  createEnumMembersFromSchema,
} from './generator/utils/enums';
import { IMPORT_RUNTIME } from './generator/utils/ref';
import { createTypeFromSchema } from './generator/components/schemas';
import { sanitizeTypeIdentifier } from './generator/utils/operation-name';
import { createAuthMethodsFactory } from './generator/api/security';

export function createSchemaComponents(
  schemas: SchemasObject,
  ctx: Context,
): Statement[] {
  return Object.entries(schemas).map(([key, schema]) => {
    let node: Statement;

    if (ctx.generateEnums() && canConvertSchemaToEnum(schema)) {
      node = factory.createEnumDeclaration(
        undefined,
        [factory.createModifier(SyntaxKind.ExportKeyword)],
        factory.createIdentifier(sanitizeTypeIdentifier(key)),
        createEnumMembersFromSchema(schema),
      );
    } else {
      node = factory.createTypeAliasDeclaration(
        undefined,
        [factory.createModifier(SyntaxKind.ExportKeyword)],
        factory.createIdentifier(sanitizeTypeIdentifier(key)),
        undefined,
        createTypeFromSchema(schema, ctx),
      );
    }

    if (ctx.hasJSDoc()) {
      addJSDocToNode(node, getJSDocFromSchema(schema));
    }
    return node;
  });
}

export function generateClient(
  specs: OpenAPIObject,
  name: string,
  opts?: ContextOptions,
): SourceFile {
  const ctx = new Context(opts);

  if (!specs.openapi) {
    throw new Error("This specification doesn't look like an OpenAPI spec");
  }

  if (specs.components) {
    ctx.initComponents(specs.components);
  }

  const clientClass = createClient(specs, name, ctx);
  const schemaStmts = specs.components?.schemas
    ? createSchemaComponents(specs.components?.schemas, ctx)
    : [];

  if (ctx.isOnlyTypes()) {
    return factory.createSourceFile(
      schemaStmts,
      factory.createToken(SyntaxKind.EndOfFileToken),
      NodeFlags.Const,
    );
  }

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

export function getStringFromSourceFile(src: SourceFile): string {
  const printer = createPrinter({ newLine: NewLineKind.LineFeed });

  return printer.printFile(src);
}
