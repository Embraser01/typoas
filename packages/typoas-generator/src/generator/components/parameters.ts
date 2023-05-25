import { TypeNode } from 'typescript';
import { Context } from '../../context';
import {
  isReferenceObject,
  ParameterObject,
  ReferenceObject,
} from 'openapi3-ts/oas31';
import { createTypeFromSchema } from '../utils/types';

export function createSchemaTypeFromParameters(
  parameter: ParameterObject | ReferenceObject,
  ctx: Context,
): TypeNode {
  if (isReferenceObject(parameter)) {
    const ref = ctx.resolveReference('parameters', parameter.$ref);
    if (!ref) {
      throw new Error(`$ref '${parameter.$ref}' wasn't found`);
    }
    return createTypeFromSchema(ref.spec.schema, ctx);
  }
  return createTypeFromSchema(parameter.schema, ctx);
}

export function getParameterName(
  parameter: ParameterObject | ReferenceObject,
  ctx: Context,
): string {
  if (isReferenceObject(parameter)) {
    const ref = ctx.resolveReference('parameters', parameter.$ref);
    if (!ref) {
      throw new Error(`$ref '${parameter.$ref}' wasn't found`);
    }
    return ref.spec.name;
  }
  return parameter.name;
}

export function isParameterRequired(
  parameterOrRef: ParameterObject | ReferenceObject,
  ctx: Context,
): boolean {
  let parameter = parameterOrRef as ParameterObject;
  if (isReferenceObject(parameterOrRef)) {
    const ref = ctx.resolveReference('parameters', parameterOrRef.$ref);
    if (!ref) {
      throw new Error(`$ref '${parameterOrRef.$ref}' wasn't found`);
    }
    parameter = ref.spec;
  }

  // Cookies can be fully handled by the navigator, so we need to
  // declare those as optional.
  if (parameter.in === 'cookie') {
    return false;
  }
  return !!parameter.required;
}
