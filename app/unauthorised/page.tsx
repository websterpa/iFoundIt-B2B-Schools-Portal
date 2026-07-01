import Link from 'next/link'

export default function UnauthorisedPage() {
  return (
    <main>
      <h1>Access restricted</h1>
      <p>Your account does not have permission to view that page.</p>
      <Link href="/dashboard">Return to your workspace</Link>
    </main>
  )
}
