import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <p className="marketing-eyebrow">iFoundIt Schools</p>
        <h1>Secure recovery workflows for school phone pouches.</h1>
        <p className="marketing-lead">
          Give school staff a separate admin portal, keep public finder journeys privacy-safe, and
          add recovery support to the pouch rollout you already manage.
        </p>
        <div className="marketing-actions">
          <Link className="marketing-button marketing-button--primary" href="/schools/pouch-protection">
            Explore pouch protection
          </Link>
          <Link className="marketing-button marketing-button--secondary" href="/login">
            Portal login
          </Link>
        </div>
      </section>
    </main>
  )
}
