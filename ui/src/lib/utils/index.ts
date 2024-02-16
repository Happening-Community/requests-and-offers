/**
 * Check if the given object is empty.
 *
 * @param {object} obj - The object to be checked for emptiness
 * @return {boolean} True if the object is empty, otherwise false
 */
export function isEmptyObj(obj: object) {
  return Object.keys(obj).length === 0;
}
