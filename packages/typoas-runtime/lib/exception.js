"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiException = void 0;
/**
 * Represents an error caused by an api call i.e. it has attributes for a HTTP status code
 * and the returned body object.
 *
 * Example
 * API returns a ErrorMessageObject whenever HTTP status code is not in [200, 299]
 * => ApiException(404, someErrorMessageObject)
 *
 */
class ApiException extends Error {
    constructor(code, body) {
        super('HTTP-Code: ' + code + '\nMessage: ' + JSON.stringify(body));
        this.code = code;
        this.body = body;
    }
}
exports.ApiException = ApiException;
