function splitStyles(obj: Record<string, unknown>) {
  const classes: Record<string, unknown> = {}
  const rest:    Record<string, unknown> = {}

  const classRx = /^\.[a-z0-9-_]+$/i           // una sola clase, sin espacios, comas ni :
  for (const [k, v] of Object.entries(obj)) {
    if (classRx.test(k)) classes[k] = v
    else rest[k] = v
  }
  return { classes, rest }
}

export default splitStyles