# CHANGELOG.md

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
