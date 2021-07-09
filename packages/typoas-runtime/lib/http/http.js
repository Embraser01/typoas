"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
exports.ResponseContext = exports.RequestContext = exports.HttpMethod = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const URLParse = require("url-parse");
__exportStar(require("./isomorphic-fetch"), exports);
/**
 * Represents an HTTP method.
 */
var HttpMethod;
(function (HttpMethod) {
    HttpMethod["GET"] = "GET";
    HttpMethod["HEAD"] = "HEAD";
    HttpMethod["POST"] = "POST";
    HttpMethod["PUT"] = "PUT";
    HttpMethod["DELETE"] = "DELETE";
    HttpMethod["CONNECT"] = "CONNECT";
    HttpMethod["OPTIONS"] = "OPTIONS";
    HttpMethod["TRACE"] = "TRACE";
    HttpMethod["PATCH"] = "PATCH";
})(HttpMethod = exports.HttpMethod || (exports.HttpMethod = {}));
/**
 * Represents an HTTP request context
 */
class RequestContext {
    /**
     * Creates the request context using a http method and request resource url
     *
     * @param url url of the requested resource
     * @param httpMethod http method
     */
    constructor(url, httpMethod) {
        this.httpMethod = httpMethod;
        this.headers = {};
        this.body = undefined;
        this.url = new URLParse(url, true);
    }
    /*
     * Returns the url set in the constructor including the query string
     *
     */
    getUrl() {
        return this.url.toString();
    }
    /**
     * Replaces the url set in the constructor with this url.
     *
     */
    setUrl(url) {
        this.url = new URLParse(url, true);
    }
    /**
     * Sets the body of the http request either as a string or FormData
     *
     * Note that setting a body on a HTTP GET, HEAD, DELETE, CONNECT or TRACE
     * request is discouraged.
     * https://httpwg.org/http-core/draft-ietf-httpbis-semantics-latest.html#rfc.section.7.3.1
     *
     * @param body the body of the request
     */
    setBody(body) {
        this.body = body;
    }
    getHttpMethod() {
        return this.httpMethod;
    }
    getHeaders() {
        return this.headers;
    }
    getBody() {
        return this.body;
    }
    setQueryParam(name, value) {
        const queryObj = this.url.query;
        queryObj[name] = value;
        this.url.set('query', queryObj);
    }
    /**
     *  Sets a cookie with the name and value. NO check  for duplicate cookies is performed
     *
     */
    addCookie(name, value) {
        if (!this.headers['Cookie']) {
            this.headers['Cookie'] = '';
        }
        this.headers['Cookie'] += name + '=' + value + '; ';
    }
    setHeaderParam(key, value) {
        this.headers[key] = value;
    }
}
exports.RequestContext = RequestContext;
class ResponseContext {
    constructor(httpStatusCode, headers, body) {
        this.httpStatusCode = httpStatusCode;
        this.headers = headers;
        this.body = body;
    }
    /**
     * Parse header value in the form `value; param1="value1"`
     *
     * E.g. for Content-Type or Content-Disposition
     * Parameter names are converted to lower case
     * The first parameter is returned with the key `""`
     */
    getParsedHeader(headerName) {
        const result = {};
        if (!this.headers[headerName]) {
            return result;
        }
        const parameters = this.headers[headerName].split(';');
        for (const parameter of parameters) {
            let [key, value] = parameter.split('=', 2);
            key = key.toLowerCase().trim();
            if (value === undefined) {
                result[''] = key;
            }
            else {
                value = value.trim();
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                result[key] = value;
            }
        }
        return result;
    }
    getBodyAsFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.body.binary();
            const fileName = this.getParsedHeader('content-disposition')['filename'] || '';
            const contentType = this.headers['content-type'] || '';
            try {
                return new File([data], fileName, { type: contentType });
            }
            catch (error) {
                /** Fallback for when the File constructor is not available */
                return Object.assign(data, {
                    name: fileName,
                    type: contentType,
                });
            }
        });
    }
}
exports.ResponseContext = ResponseContext;
