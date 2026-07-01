export function requireAuth(userId: string | null): boolean {
  return Boolean(userId)
}
