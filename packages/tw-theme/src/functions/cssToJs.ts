/**
 * Prepares CSS objects for component generation.
 * Currently clones the object, but can be extended for
 * selector renaming, prefixes, validations, etc.
 */
const prepareComponentStyles = (
  cssObject: Record<string, any>
): Record<string, any> => ({
  ...cssObject
});

export default prepareComponentStyles;
