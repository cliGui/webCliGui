/**
 * Returns the differences between two objects.
 * 
 * @param orgObj - The original object.
 * @param modObj - The modified object.
 * @param bailOut - Bail out as soon as a difference is found
 * @param idFields - If there is a change in an object then the object is checked whether it has
 *                   one of the fields in the idFields. If so, then that field is set on the diffObj
 * @returns The differences between `orgObj` and `modObj`. Returns undefined if both are identical.
 */
const deepDiff = (orgObj: any, modObj: any, bailOut: boolean = false, idFields: string[] | null = null): any => {
  if (modObj === orgObj) return undefined;

  // Handle Date
  if (orgObj instanceof Date && modObj instanceof Date ) {
    return orgObj.getTime() !== modObj.getTime() ? modObj : undefined;
  }

  // Handle Map
  if (orgObj instanceof Map && modObj instanceof Map) {
    const diffMap = new Map();
    for (let [key, modVal] of modObj) {
      const orgVal = orgObj.get(key);
      const subDiff = deepDiff(orgVal, modVal, bailOut, idFields);
      if (typeof subDiff !== 'undefined') {
        diffMap.set(key, subDiff);
        if (bailOut) break;
      }
    }
    return diffMap.size > 0 ? diffMap : undefined;
  }

  // Handle Set
  if (orgObj instanceof Set && modObj instanceof Set) {
    const onlyInOrg = [...orgObj].filter(x => !modObj.has(x));
    const onlyInMod = [...modObj].filter(x => !orgObj.has(x));
    if (onlyInOrg.length || onlyInMod.length) {
      const diffSet = new Set(onlyInMod.concat(onlyInOrg));
      return diffSet;
    }
    return undefined;
  }

  // Handle array
  if (orgObj instanceof Array && modObj instanceof Array) {
    const diffArray = [];
    for (let idx = 0; idx < modObj.length; ++idx) {
      const orgVal = orgObj[idx];
      const modVal = modObj[idx];
      const diffVal = deepDiff(orgVal, modVal, bailOut, idFields);
      if (typeof diffVal !== 'undefined') {
        diffArray.push(diffVal);
        if (bailOut) break;
      }
    }
    return diffArray.length > 0 ? diffArray : undefined;
  }

  // Handle plain objects
  if (
    typeof orgObj === 'object' &&
    typeof modObj === 'object' &&
    orgObj !== null &&
    modObj !== null
  ) {
    const diffObj = {};
    for (let key of Object.keys(modObj)) {
      const subDiff = deepDiff(orgObj[key], modObj[key], bailOut, idFields);
      if (typeof subDiff !== 'undefined') {
        // @ts-ignore
        diffObj[key] = subDiff;
        if (bailOut) return diffObj;
      }
    }

    if (Object.keys(diffObj).length === 0) {
      return undefined;
    }
      
    if (idFields) {
      for (const idField of idFields) {
        if (modObj[idField]) {
          // @ts-ignore
          diffObj[idField] = modObj[idField];
          break;
        }
      }
    }
    return diffObj;
  }

  // Fallback for primitive values
  return orgObj !== modObj ? modObj : undefined;
};

export default deepDiff;
