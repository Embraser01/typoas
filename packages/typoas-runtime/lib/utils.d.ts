/**
 * Returns if a specific http code is in a given code range
 * where the code range is defined as a combination of digits
 * and "X" (the letter X) with a length of 3
 *
 * @param codeRange string with length 3 consisting of digits and "X" (the letter X)
 * @param code the http status code to be checked against the code range
 */
export declare function isCodeInRange(codeRange: string, code: number): boolean;
/**
 * Serialize a parameter from anything to string.
 */
export declare function serializeParameter(data: unknown): string;
export declare function applyTemplating(val: string, variables: Record<string, unknown>): string;
