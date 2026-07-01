const DEFAULT_PATH = '/dashboard'

export function normaliseNextPath(nextPath: string | null | undefined): string {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return DEFAULT_PATH
  }

  return nextPath
}
