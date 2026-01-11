/**
 * This replacer() replaces maps with data objects so that ReduxTools can compare the data
 * and show the actual data differences. This is just for debugging in the browser when
 * looking at the zustand data in the Redux tool.
 */
const mapToObject = (map: Map<any, any> | null): Record<string, any> | null => {
  if (!map) return null;
  const obj: Record<string, any> = {};
  for (const [key, value] of map.entries()) {
    obj[key] = value instanceof Map ? mapToObject(value) : value;
  }
  return obj;
};

const replacer = (_key: string, value: any) => {
  if (value instanceof Map) {
    return mapToObject(value);
  }
  return value;
};

export default replacer;
