import type { Metadata } from 'next'

import { PouchProtectionPageContent } from '@/components/marketing/pouch-protection-page-content'

export const metadata: Metadata = {
  title: 'Phone Pouch Protection | iFoundIt Schools',
  description:
    'Add NFC recovery tags to the school phone pouches you already issue without exposing student data.'
}

export default function PouchProtectionPage() {
  return <PouchProtectionPageContent />
}
