// Parse inert markup only: DOMParser never runs scripts or loads resources, and the
// parsed document is never attached to the page. Comments, script/style text and
// template content are not element descendants, so they cannot satisfy a check.
export function hasNestedElement(markup: string, parent: string, child: string): boolean {
  if (typeof DOMParser === 'undefined') return false
  try {
    const doc = new DOMParser().parseFromString(markup, 'text/html')
    return doc.querySelector(`${parent} ${child}`) !== null
  } catch {
    return false
  }
}
