// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fun = (...args: any) => any;

let funcNames = new WeakMap<Fun, string>();
const names = new Set<string>();

/**
 * Return a unique name for a specific function.
 * This is used in order to have a unique name for the React query hooks.
 *
 * By default, will use the function name if not already used, and append a random ID if it is.
 */
export function getQueryFunctionKey(func: Fun): string {
  const name = funcNames.get(func);
  if (name) {
    return name;
  }

  let newName = func.name;
  while (names.has(newName)) {
    // No need to generate a true random ID, no crypto here, and we
    // already manage collisions with the while loop.
    const randomID = (Math.random() + 1).toString(36).substring(7);
    newName = `${func.name}_${randomID}`;
  }

  names.add(newName);
  funcNames.set(func, newName);
  return newName;
}

/**
 * Reset the function names cache.
 *
 * This is useful for tests
 * @internal
 */
export function _resetFuncNames(): void {
  funcNames = new WeakMap<Fun, string>();
  names.clear();
}
