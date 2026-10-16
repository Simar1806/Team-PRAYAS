/**
 * Tiny classnames helper — joins truthy class strings.
 * Keeps the codebase dependency-free.
 * @param {...(string|false|null|undefined)} parts
 * @returns {string}
 */
export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}
