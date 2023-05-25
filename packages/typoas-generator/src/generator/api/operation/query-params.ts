import {
  ParameterObject,
  ReferenceObject,
  isReferenceObject,
} from 'openapi3-ts/oas31';
import { factory, StringLiteral } from 'typescript';
import { Context } from '../../../context';

export function getQueryParams(
  parametersOrRefs: (ParameterObject | ReferenceObject)[],
  ctx: Context,
): StringLiteral[] {
  const strings: StringLiteral[] = [];

  const usedParams = new Set<string>();
  for (const p of parametersOrRefs) {
    let parameter = p as ParameterObject;
    if (isReferenceObject(p)) {
      const ref = ctx.resolveReference('parameters', p.$ref);
      if (!ref) {
        throw new Error(`$ref '${p.$ref}' wasn't found`);
      }
      parameter = ref.spec;
    }

    if (!usedParams.has(parameter.name)) {
      usedParams.add(parameter.name);
      if (parameter.in === 'query') {
        strings.push(factory.createStringLiteral(parameter.name));
      }
    }
  }

  return strings;
}
