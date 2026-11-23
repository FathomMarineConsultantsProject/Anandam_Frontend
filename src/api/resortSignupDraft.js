/**
 * Unregistered resort signup draft. No account is created until Publish.
 * In-memory only: credentials and local File objects are not persisted to disk.
 * Navigating away/reloading before publication loses the unsubmitted draft.
 */
let pending = null;

export function beginResortSignup(credentials) {
  pending = { ...credentials };
}
export function peekResortSignup() {
  return pending;
}
export function clearResortSignup() {
  pending = null;
}
