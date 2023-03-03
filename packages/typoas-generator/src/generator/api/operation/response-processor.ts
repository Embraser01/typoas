import { OperationObject, ReferenceObject, ResponseObject } from 'openapi3-ts';

export function getSuccessResponses(
  operation: OperationObject,
): (ResponseObject | ReferenceObject)[] {
  if (!operation.responses) {
    return [];
  }
  const successResponses = Object.keys(operation.responses).filter(
    (k) => k.startsWith('2') || k.startsWith('3'),
  );
  if (operation.responses.default && successResponses.length === 0) {
    return [operation.responses.default];
  }
  return successResponses.map((k) => operation.responses[k]);
}
