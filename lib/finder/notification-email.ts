export function schoolNotificationEmail(value: string | undefined) {
  const email = value?.trim().toLowerCase() ?? ''
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  const domain = email.split('@')[1]
  // Confirmed fixture accounts are not necessarily routable email recipients.
  const reserved = ['local', 'localhost', 'test', 'invalid', 'example', 'example.com', 'example.net', 'example.org']
  if (reserved.some((suffix) => domain === suffix || domain.endsWith(`.${suffix}`))) return null
  return email
}
