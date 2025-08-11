/**
 * Separates CSS class selectors from other CSS rules.
 *
 * @param cssObject - An object containing CSS rules.
 * @returns An object with `classSelectors` and `otherStyles` separated.
 */
function separateClassSelectorsFromStyles(cssObject: Record<string, unknown>) {
  const classSelectors: Record<string, unknown> = {}
  const otherStyles: Record<string, unknown> = {}

  // Updated regex to match component class selectors even with pseudo-classes
  // Matches patterns like:
  // .btn-dash
  // .btn-dash:not(...)
  // .btn-outline:hover
  // .btn-soft:not(.btn-active,:hover,:focus-visible)
  const componentClassRegex = /^\.[a-z0-9-_]+(?::[^{}]*)?$/i
  for (const [key, value] of Object.entries(cssObject)) {
    if (componentClassRegex.test(key)) {
      classSelectors[key] = value
    } else {
      otherStyles[key] = value
    }
  }
  return { classSelectors, otherStyles }
}

export default separateClassSelectorsFromStyles