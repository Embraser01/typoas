import { Context, ContextOptions } from './context';
import {
  ComponentsObject,
  isSchemaObject,
  OpenAPIObject,
} from 'openapi3-ts/oas31';
import './libs';
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
import {
  createAuthMethodsType,
  createConfigureAuthFunction,
} from './generator/api/security';
import { createOperationList } from './generator/api/operation-list';
import { createContextFactory } from './generator/api/context-factory';
import { createAllSchemaTransforms } from './generator/api/schemas-transformers';

export function createSchemaComponents(
  schemas: Exclude<ComponentsObject['schemas'], undefined>,
  ctx: Context,
): Statement[] {
  const statements: Statement[] = [];
  const overrides = new Set<string>();

  for (const [key, schema] of Object.entries(schemas)) {
    const sainKey = sanitizeTypeIdentifier(key);
    let node: Statement;

    if (ctx.getOverrideImport() && ctx.hasOverride(sainKey)) {
      overrides.add(sainKey);
    } else {
      if (ctx.generateEnums() && canConvertSchemaToEnum(schema)) {
        node = factory.createEnumDeclaration(
          [factory.createModifier(SyntaxKind.ExportKeyword)],
          factory.createIdentifier(sainKey),
          createEnumMembersFromSchema(schema),
        );
      } else {
        node = factory.createTypeAliasDeclaration(
          [factory.createModifier(SyntaxKind.ExportKeyword)],
          factory.createIdentifier(sainKey),
          undefined,
          createTypeFromSchema(schema, ctx),
        );
      }

      if (ctx.hasJSDoc() && isSchemaObject(schema)) {
        addJSDocToNode(node, getJSDocFromSchema(schema));
      }
      statements.push(node);
    }
  }

  // Handle overrides if needed
  if (overrides.size) {
    statements.unshift(
      factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          true,
          undefined,
          factory.createNamedImports(
            Array.from(overrides).map((name) =>
              factory.createImportSpecifier(
                false,
                undefined,
                factory.createIdentifier(name),
              ),
            ),
          ),
        ),
        factory.createStringLiteral(ctx.getOverrideImport()!, true),
      ),
    );
  }

  return statements;
}

export function generateClient(
  specs: OpenAPIObject,
  opts?: ContextOptions,
): SourceFile {
  const ctx = new Context(opts);
  const statements: Statement[] = [];

  if (!specs.openapi) {
    throw new Error("This specification doesn't look like an OpenAPI spec");
  }

  if (specs.components) {
    ctx.initComponents(specs.components);
  }

  if (specs.components?.schemas) {
    statements.push(...createSchemaComponents(specs.components.schemas, ctx));
  }

  if (ctx.isOnlyTypes()) {
    return factory.createSourceFile(
      statements,
      factory.createToken(SyntaxKind.EndOfFileToken),
      NodeFlags.Const,
    );
  }

  // Add to start of the file
  statements.unshift(
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamespaceImport(factory.createIdentifier(IMPORT_RUNTIME)),
      ),
      factory.createStringLiteral('@typoas/runtime', true),
    ),
  );
  statements.push(...createAllSchemaTransforms(specs, ctx));

  const securitySchemes = specs.components?.securitySchemes || {};
  statements.push(createAuthMethodsType(securitySchemes, ctx));

  if (Object.keys(securitySchemes).length) {
    statements.push(createConfigureAuthFunction(securitySchemes, ctx));
  }
  statements.push(createContextFactory(specs, ctx));
  statements.push(...createOperationList(specs, ctx));

  return factory.createSourceFile(
    statements,
    factory.createToken(SyntaxKind.EndOfFileToken),
    NodeFlags.Const,
  );
}

export function getStringFromSourceFile(src: SourceFile): string {
  const printer = createPrinter({ newLine: NewLineKind.LineFeed });

  return printer.printFile(src);
}
