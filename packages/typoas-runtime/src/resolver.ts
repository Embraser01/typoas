import type { TransformField } from './transformers';

export interface TransformResolver {
  getTransforms(type: string, ref: string): TransformField;
}

export class RefResolver implements TransformResolver {
  constructor(
    private transforms: Record<string, Record<string, TransformField>>,
  ) {}

  getTransforms(type: string, ref: string): TransformField {
    return this.transforms[ref][type] || [];
  }
}
