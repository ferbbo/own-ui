/**
 * Separates CSS class selectors from other CSS rules.
 *
 * @param cssObject - An object containing CSS rules.
 * @returns An object with `classSelectors` and `otherStyles` separated.
 */
function separateClassSelectorsFromStyles(cssObject: Record<string, unknown>) {
  const classSelectors: Record<string, unknown> = {}
  const otherStyles: Record<string, unknown> = {}

  const classRegex = /^\.[a-z0-9-_]+$/i
  for (const [key, value] of Object.entries(cssObject)) {
    if (classRegex.test(key)) {
      classSelectors[key] = value
    } else {
      otherStyles[key] = value
    }
  }
  return { classSelectors, otherStyles }
}

export default separateClassSelectorsFromStyles