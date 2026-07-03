import type { ReactNode } from 'react'

import { MarketingShell } from '@/components/marketing/marketing-shell'
import './marketing.css'

type MarketingLayoutProps = {
  children: ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="ifs-scope">
      <MarketingShell>{children}</MarketingShell>
    </div>
  )
}
