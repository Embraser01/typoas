import type { TransformField, TransformResolver } from './transformers';

export class RefResolver implements TransformResolver {
  constructor(
    private transforms: Record<string, Record<string, TransformField[]>>,
  ) {}

  getTransforms(type: string, ref: string): TransformField[] {
    return this.transforms[ref]?.[type] || [];
  }
}
