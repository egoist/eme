export function truncate(str, max) {
  if (str.length > max) return str.substr(max) + '...'
  return str
}
