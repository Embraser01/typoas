import {
  ParameterObject,
  ReferenceObject,
  SecurityRequirementObject,
} from 'openapi3-ts';

export type GlobalParameters = {
  baseParameters: (ParameterObject | ReferenceObject)[];
  defaultSecurityRequirements?: SecurityRequirementObject[];
};
