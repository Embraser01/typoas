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
exports.HttpSecurityAuthentication = void 0;
class HttpSecurityAuthentication {
    constructor(config, provider) {
        this.provider = provider;
        this.scheme = config.scheme;
        this.bearerFormat = config.bearerFormat;
    }
    applySecurityAuthentication(context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider)
                return;
            const config = yield this.provider.getConfig();
            if (this.scheme === 'basic') {
                const { username, password } = config;
                const base64 = window.btoa(`${username}:${password}`);
                return context.setHeaderParam('Authorization', `Basic ${base64}`);
            }
            if (this.scheme === 'bearer') {
                const token = config;
                return context.setHeaderParam('Authorization', `Bearer ${token}`);
            }
        });
    }
}
exports.HttpSecurityAuthentication = HttpSecurityAuthentication;
