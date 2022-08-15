export function validAreaLineRule(line) {
  return typeof line === 'number' && line >= 0 && Number.isInteger(line)
}
