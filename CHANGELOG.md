# CHANGELOG.md

## Unreleased

---

## 4.2.2 - 2025-02-12

> Only @typoas/react-query was updated to 4.2.2

- fix(react-query): Override queryKey instead of queryHashKey [#78](https://github.com/Embraser01/typoas/pull/78)

## 4.2.1 - 2025-02-12

> Only @typoas/react-query was updated to 4.2.1

- fix(react-query): Build CJS and ESM version [#77](https://github.com/Embraser01/typoas/pull/77)

## 4.2.0 - 2025-02-10

> All packages were updated to 4.2.0

- fix(runtime): Enhance status response type to handle 5XX errors [#76](https://github.com/Embraser01/typoas/pull/76)
- feat(react-query): Export getQueryFunctionKey helper [#75](https://github.com/Embraser01/typoas/pull/75)
- fix(generator): Simplify sub schemas with type object [#74](https://github.com/Embraser01/typoas/pull/74)
- feat(generator): Allow overrides during generation (fix [#71](https://github.com/Embraser01/typoas/issues/71)) [#73](https://github.com/Embraser01/typoas/pull/73)
- fix(generator): Handle patternProperties & unevaluatedProperties [#72](https://github.com/Embraser01/typoas/pull/72)

## 4.1.0 - 2024-09-09

> All packages were updated to 4.1.0 except `@typoas/react-query` which was directly bump to 4.2.0

- Add support for `openIdConnect` security scheme type (fixes [#69](https://github.com/Embraser01/typoas/pull/69)) [#70](https://github.com/Embraser01/typoas/pull/70)

## 4.0.0 - 2024-08-21

> All packages were updated to 4.0.0

- Add `-p,--prettier` option to the cli to format the generated code with prettier [#51](https://github.com/Embraser01/typoas/pull/51)
- Add a new `@typoas/react-query` package to generate fully typed react-query hooks [#63](https://github.com/Embraser01/typoas/pull/63)
- **BREAKING**: `FetcherData` must now extend `BaseFetcherData`. This change allow to have default options like `signal` for every request (fixes [#62](https://github.com/Embraser01/typoas/issues/62)) [#64](https://github.com/Embraser01/typoas/issues/64)
- **BREAKING**: Generate all responses types (fixes [#57](https://github.com/Embraser01/typoas/issues/57)) [#60](https://github.com/Embraser01/typoas/pull/60)
  - Functions will not throw on non-2XX http status anymore
  - Instead, users will have to check themselves or use the `ok` helper function

> The reason behind this is to allow easier error handling with better error typing. It also improves multiple success response handling (for complex usage mainly)

## 3.1.7 - 2024-02-23, 2024-04-17

- Automated release process

## 3.1.6 - 2024-02-23

> Only the runtime was published, the generator and cli are still at 3.1.5

- Allow null return value in AuthProvider.getConfig() [#50](https://github.com/Embraser01/typoas/pull/50)

## 3.1.2 - 2024-01-26

> Only the runtime was published, the generator and cli are still at 3.1.5

- Fix AuthProviders configuration [#44](https://github.com/Embraser01/typoas/issues/44)

## 3.1.5 - 2023-10-25

> Only the generator and cli were published, the runtime is still at 3.1.3

### **Minor Changes**

- Handle most of quoted property name issues [#47](https://github.com/Embraser01/typoas/issues/47)

## 3.1.4 - 2023-08-21

> Only the generator and cli were published, the runtime is still at 3.1.3

> Version 3.1.2 and 3.1.3 are broken, please upgrade to 3.1.4

### **Minor Changes**

- Fixes usage of the cli with npx (cf. [#45](https://github.com/Embraser01/typoas/issues/45), [#34](https://github.com/Embraser01/typoas/issues/34))

## 3.1.1 - 2023-07-04

> Version 3.1.0 is broken, please upgrade to 3.1.1

### **Minor Changes**

- Allow BearerAuthConfig to override prefix name
- Fix generator when a `securityScheme` had special chars

## 3.0.1 - 2023-06-28

### **Minor Changes**

- Do not add content-type header when formdata or blob body ([#41](https://github.com/Embraser01/typoas/pull/41))

## 3.0.0 - 2023-06-16

### **Major Changes**

- The RefResolver system that was used to resolve OpenAPI refs
  and apply transforms was reworked in order to be **tree shakable**.
- This reworked allowed us to reduce the generated file by removing
  useless transforms and refs.
- **BREAKING CHANGE**: The `RefResolver` class was removed from the runtime
  and replaced by arrow functions.
- **BREAKING CHANGE**: `HttpSecurityAuthentication` was split into two classes:
  - `HttpBasicSecurityAuthentication` for basic authentication
  - `HttpBearerSecurityAuthentication` for bearer authentication
- **BREAKING CHANGE**: When running the client on Node, the minimum version is now 16.

### **Minor Changes**

- Fix generator where `*/` appears in JSDoc comments.
- The `description` field in the `SecurityAuthentication` interface wasn't used and is now removed.

Most of those changes shouldn't affect the usage of the library, so upgrade should be easy.
To upgrade:

- Update all `@typoas/*` to `^3.0.0`
- Rerun the generator
- Enjoy!

## Before 3.0.0

Before 3.0.0, there wasn't a changelog. Please refer to the [commit history](https://github.com/Embraser01/typoas/commits/main).
