import { ProtectedAppShell } from '@/components/layout/protected-app-shell'

const SUPERADMIN_NAV_LINKS = [
  { href: '/admin', label: 'Schools' },
  { href: '/admin/tags', label: 'Tag provisioning' },
  { href: '/admin/demo-requests', label: 'Demo requests' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/students', label: 'Students' },
  { href: '/tags', label: 'Tags' },
  { href: '/events', label: 'Events' },
  { href: '/settings', label: 'Settings' }
]

export default function AdminTagsLoading() {
  return (
    <ProtectedAppShell schoolName="iFoundIt superadmin" navLinks={SUPERADMIN_NAV_LINKS}>
      <h2>Tag provisioning</h2>
      <p>Loading provisioning workspace…</p>
    </ProtectedAppShell>
  )
}
