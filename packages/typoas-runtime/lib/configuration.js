"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerConfiguration = void 0;
const http_1 = require("./http/http");
const utils_1 = require("./utils");
/**
 *
 * Represents the configuration of a server including its
 * url template and variable configuration based on the url.
 *
 */
class ServerConfiguration {
    constructor(url, variableConfiguration) {
        this.url = url;
        this.variableConfiguration = variableConfiguration;
    }
    /**
     * Sets the value of the variables of this server.
     *
     * @param variableConfiguration a partial variable configuration for the variables contained in the url
     */
    setVariables(variableConfiguration) {
        Object.assign(this.variableConfiguration, variableConfiguration);
    }
    getConfiguration() {
        return this.variableConfiguration;
    }
    /**
     * Creates a new request context for this server using the url with variables
     * replaced with their respective values and the endpoint of the request appended.
     *
     * @param endpoint the endpoint to be queried on the server
     * @param httpMethod httpMethod to be used
     *
     */
    makeRequestContext(endpoint, httpMethod) {
        return new http_1.RequestContext(utils_1.applyTemplating(this.url, this.variableConfiguration) + endpoint, httpMethod);
    }
}
exports.ServerConfiguration = ServerConfiguration;
