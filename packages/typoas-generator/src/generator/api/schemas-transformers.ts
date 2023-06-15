import { factory, NodeFlags, Statement, SyntaxKind } from 'typescript';
import { OpenAPIObject } from 'openapi3-ts/oas31';
import { Context } from '../../context';
import {
  TransformerType,
  TransformField,
} from '../utils/transformers/leaf-transformer-base';
import {
  createFromRawTransforms,
  getSchemaTransforms,
} from '../utils/transformers';
import { sanitizeTransformEntity } from '../utils/operation-name';
import { createRuntimeRefType, ExportedRef } from '../utils/ref';

function hasTransforms(fields: TransformField[]): boolean {
  for (const field of fields) {
    const [t, val] = field[field.length - 1];
    if (t === 'this') {
      return true;
    }
    if (t === 'select' && hasTransforms(val)) {
      return true;
    }
  }
  return false;
}

/**
 * Filter `fields` to remove any that don't have a transform (deeply through refs).
 * Return true if any fields were removed.
 */
function filterUnknownRefs(
  fields: TransformField[],
  simpleTransforms: Set<string>,
): boolean {
  let changed = false;
  for (const field of fields) {
    const [t, val] = field[field.length - 1];
    // Remove field if ref isn't used
    if (t === 'ref' && !simpleTransforms.has(val)) {
      changed = true;
      fields.splice(fields.indexOf(field), 1);
      // If select, recursive check each field set
    } else if (t === 'select') {
      changed ||= filterUnknownRefs(val, simpleTransforms);
      if (!val.length) {
        fields.splice(fields.indexOf(field), 1);
      }
    }
  }
  return changed;
}

export function createAllSchemaTransforms(
  specs: OpenAPIObject,
  ctx: Context,
): Statement[] {
  const schemas = specs.components?.schemas || {};

  const transforms: Record<string, TransformField[]> = {};
  for (const type of Object.values(TransformerType)) {
    // Set of $date_Pet like names that have a real transform (not just a ref)
    const simpleTransforms = new Set<string>();

    // 1. Load all transforms for components schemas
    for (const [name, schema] of Object.entries(schemas)) {
      const res = getSchemaTransforms(type, schema);
      if (res.length) {
        const sanitizedName = sanitizeTransformEntity(type, name);
        transforms[sanitizedName] = res;
        ctx.transformSchemas.add(sanitizedName);
        if (hasTransforms(res)) {
          simpleTransforms.add(sanitizedName);
        }
      }
    }

    // 2. Optimize transforms
    let changed = true;
    while (changed) {
      changed = false;
      for (const [name, fields] of Object.entries(transforms)) {
        changed ||= filterUnknownRefs(fields, simpleTransforms);
        if (!fields.length) {
          delete transforms[name];
          ctx.transformSchemas.delete(name);
        }
      }
    }
  }

  // 3. Create remaining transforms
  return Object.entries(transforms).map(([name, fields]) =>
    factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            name,
            undefined,
            undefined,
            factory.createArrowFunction(
              undefined,
              undefined,
              [],
              factory.createArrayTypeNode(
                createRuntimeRefType(ExportedRef.TransformField),
              ),
              factory.createToken(SyntaxKind.EqualsGreaterThanToken),
              createFromRawTransforms(fields, ctx),
            ),
          ),
        ],
        NodeFlags.Const,
      ),
    ),
  );
}
