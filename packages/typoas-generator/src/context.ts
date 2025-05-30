/* eslint-disable @typescript-eslint/no-explicit-any */
import { TypeNode } from 'typescript';
import {
  CallbackObject,
  ComponentsObject,
  ExampleObject,
  HeaderObject,
  LinkObject,
  ParameterObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
  SecuritySchemeObject,
} from 'openapi3-ts/oas31';

type ComponentContext<T> = {
  tsNode?: TypeNode;
  imports: string[];
  name: string;
  spec: T;
};

export type ComponentType =
  | 'schemas'
  | 'responses'
  | 'parameters'
  | 'examples'
  | 'requestBodies'
  | 'headers'
  | 'securitySchemes'
  | 'links'
  | 'callbacks';

export type ComponentContextFromName<T extends ComponentType> =
  T extends 'schemas'
    ? ComponentContext<SchemaObject>
    : T extends 'responses'
      ? ComponentContext<ResponseObject>
      : T extends 'parameters'
        ? ComponentContext<ParameterObject>
        : T extends 'examples'
          ? ComponentContext<ExampleObject>
          : T extends 'requestBodies'
            ? ComponentContext<RequestBodyObject>
            : T extends 'headers'
              ? ComponentContext<HeaderObject>
              : T extends 'securitySchemes'
                ? ComponentContext<SecuritySchemeObject>
                : T extends 'links'
                  ? ComponentContext<LinkObject>
                  : ComponentContext<CallbackObject>;

export type ComponentRegistry<T extends ComponentType> = Map<
  string,
  ComponentContextFromName<T>
>;

export type ContextOptions = {
  generateEnums?: boolean;
  jsDoc?: boolean;
  onlyTypes?: boolean;
  fetcherOptions?: boolean;
  anyInsteadOfUnknown?: boolean;
  wrapLinesAt?: number;
  fullResponseMode?: boolean;
  overrides?: { import: string; list: string[] };
};

export class Context {
  schemas: ComponentRegistry<'schemas'> = new Map();
  responses: ComponentRegistry<'responses'> = new Map();
  parameters: ComponentRegistry<'parameters'> = new Map();
  examples: ComponentRegistry<'examples'> = new Map();
  requestBodies: ComponentRegistry<'requestBodies'> = new Map();
  headers: ComponentRegistry<'headers'> = new Map();
  securitySchemes: ComponentRegistry<'securitySchemes'> = new Map();
  links: ComponentRegistry<'links'> = new Map();
  callbacks: ComponentRegistry<'callbacks'> = new Map();

  // Set of sanitized transform schemas name (e.g. $date_Pet)
  readonly transformSchemas = new Set<string>();

  constructor(private opts: ContextOptions = {}) {}

  resolveReference<T extends ComponentType>(
    type: T,
    ref: string,
  ): ComponentContextFromName<T> | null {
    const [, schemaName] =
      new RegExp(`^#/components/${type}/([^/]+)`).exec(ref) || [];

    let map;
    switch (type) {
      case 'schemas':
        map = this.schemas;
        break;
      case 'responses':
        map = this.responses;
        break;
      case 'parameters':
        map = this.parameters;
        break;
      case 'examples':
        map = this.examples;
        break;
      case 'requestBodies':
        map = this.requestBodies;
        break;
      case 'headers':
        map = this.headers;
        break;
      case 'securitySchemes':
        map = this.securitySchemes;
        break;
      case 'links':
        map = this.links;
        break;
      case 'callbacks':
        map = this.callbacks;
        break;
    }
    const schema = (map as ComponentRegistry<T>).get(schemaName);
    if (!schema) return null;
    return schema;
  }

  private addToMap(
    name: string,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    spec: ReferenceObject | any,
    map: ComponentRegistry<any>,
  ): void {
    if (map.has(name)) return;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (spec.$ref) {
      // TODO Warning
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    map.set(name, { imports: [], name, spec });
  }

  initComponents(components: ComponentsObject): void {
    Object.entries(components).forEach(([type, value]) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Object.entries(value).forEach(([name, spec]) =>
        // @ts-expect-error This[type] is not handled by TS
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.addToMap(name, spec, this[type]),
      ),
    );
  }

  generateEnums(): boolean {
    return this.opts.generateEnums === true;
  }

  generateAnyInsteadOfUnknown(): boolean {
    return this.opts.anyInsteadOfUnknown === true;
  }

  hasJSDoc(): boolean {
    return this.opts.jsDoc !== false;
  }

  hasFetcherOptions(): boolean {
    return this.opts.fetcherOptions !== false;
  }

  isOnlyTypes(): boolean {
    return !!this.opts.onlyTypes;
  }

  getWrapLinesAt(): number {
    return this.opts.wrapLinesAt || 120;
  }

  isFullResponseMode(): boolean {
    return this.opts.fullResponseMode !== false;
  }

  hasOverride(override: string): boolean {
    if (!this.opts.overrides) {
      return false;
    }
    return this.opts.overrides.list.includes(override);
  }

  getOverrideImport(): string | undefined {
    return this.opts.overrides?.import;
  }
}
