"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefResolver = void 0;
class RefResolver {
    constructor(schemas) {
        this.schemas = schemas;
    }
    resolveSchema(ref) {
        var _a;
        const [, schemaName] = /^#\/components\/schemas\/([a-zA-Z-_]+)/.exec(ref) || [];
        return (_a = this.schemas) === null || _a === void 0 ? void 0 : _a[schemaName];
    }
}
exports.RefResolver = RefResolver;
