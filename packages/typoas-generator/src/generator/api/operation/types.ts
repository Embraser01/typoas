import {
  ParameterObject,
  ReferenceObject,
  SecurityRequirementObject,
} from 'openapi3-ts/oas31';

export type GlobalParameters = {
  baseParameters: (ParameterObject | ReferenceObject)[];
  defaultSecurityRequirements?: SecurityRequirementObject[];
};
