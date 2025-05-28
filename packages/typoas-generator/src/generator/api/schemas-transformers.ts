import { factory, NodeFlags, Statement, SyntaxKind } from 'typescript';
import { OpenAPIObject } from 'openapi3-ts/oas31';
import { Context } from '../../context';
import {
  TransformerType,
  TransformField,
  TransformType,
} from '../utils/transformers/leaf-transformer-base';
import {
  createFromRawTransforms,
  getSchemaTransforms,
} from '../utils/transformers';
import { sanitizeTransformEntity } from '../utils/operation-name';
import { createRuntimeRefType, ExportedRef } from '../utils/ref';

function hasDirectTransforms(fields: TransformField[]): boolean {
  for (const field of fields) {
    const [t, val] = field[field.length - 1];
    if (t === TransformType.THIS) {
      return true;
    }
    if (t === TransformType.SELECT && hasDirectTransforms(val)) {
      return true;
    }
  }
  return false;
}

function hasNewRefWithTransform(
  name: string,
  fields: TransformField[],
  deepTransforms: Set<string>,
): boolean {
  if (deepTransforms.has(name)) {
    return false;
  }
  for (const field of fields) {
    const [t, val] = field[field.length - 1]; // Last item of transform
    // Remove field if ref isn't used
    if (t === TransformType.REF && deepTransforms.has(val)) {
      return true;
      // If select, recursive check each field set
    } else if (
      t === TransformType.SELECT &&
      hasNewRefWithTransform(name, val, deepTransforms)
    ) {
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
  schemasWithTransforms: Set<string>,
): boolean {
  let changed = false;
  for (const field of fields) {
    const [t, val] = field[field.length - 1];
    // Remove field if ref isn't used
    if (t === TransformType.REF && !schemasWithTransforms.has(val)) {
      changed = true;
      fields.splice(fields.indexOf(field), 1);
      // If select, recursive check each field set
    } else if (t === TransformType.SELECT) {
      changed ||= filterUnknownRefs(val, schemasWithTransforms);
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
    // Set of $date_Pet like names that have a transform (incl. $ref)
    const deepTransforms = new Set<string>();

    // 1. Load all transforms for components schemas
    for (const [name, schema] of Object.entries(schemas)) {
      const res = getSchemaTransforms(type, schema);
      if (res.length) {
        const sanitizedName = sanitizeTransformEntity(type, name);
        transforms[sanitizedName] = res;
        ctx.transformSchemas.add(sanitizedName);
        if (hasDirectTransforms(res)) {
          deepTransforms.add(sanitizedName);
        }
      }
    }

    // 2. Spread refs to parents
    let changed;
    do {
      changed = false;
      for (const [name, fields] of Object.entries(transforms)) {
        // Add name to deepTransforms if fields contains ref existing in deepTransforms
        // Retry until we don't add anything
        if (hasNewRefWithTransform(name, fields, deepTransforms)) {
          deepTransforms.add(name);
          changed = true;
        }
      }
    } while (changed);

    // 3. Remove transforms of refs without transforms
    do {
      changed = false;
      for (const [name, fields] of Object.entries(transforms)) {
        changed ||= filterUnknownRefs(fields, deepTransforms);
        if (!fields.length) {
          delete transforms[name];
          ctx.transformSchemas.delete(name);
        }
      }
    } while (changed);
  }

  // 4. Create remaining transforms
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
