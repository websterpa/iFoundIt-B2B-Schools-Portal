import Link from 'next/link'

export default function HomePage() {
  return (
    <main>
      <h1>iFoundIt Schools Portal</h1>
      <p>Secure school admin access for pouch recovery workflows.</p>
      <Link href="/login">Go to login</Link>
    </main>
  )
}
