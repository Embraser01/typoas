"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeySecurityAuthentication = void 0;
class ApiKeySecurityAuthentication {
    constructor(config, provider) {
        this.provider = provider;
        this.name = config.name;
        this.in = config.in;
    }
    applySecurityAuthentication(context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider)
                return;
            const apiToken = yield this.provider.getConfig();
            switch (this.in) {
                case 'query':
                    return context.setQueryParam(this.name, apiToken);
                case 'header':
                    return context.setHeaderParam(this.name, apiToken);
                case 'cookie':
                    return context.addCookie(this.name, apiToken);
            }
        });
    }
}
exports.ApiKeySecurityAuthentication = ApiKeySecurityAuthentication;
