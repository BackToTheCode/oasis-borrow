import { DiscoveryNavigation } from 'apps/main/features/discovery/common/DiscoveryNavigation'
import { DiscoveryWrapperWithIntro } from 'apps/main/features/discovery/common/DiscoveryWrapperWithIntro'
import { DiscoveryControl } from 'apps/main/features/discovery/controllers/DiscoveryControl'
import { DiscoveryPages } from 'apps/main/features/discovery/types'
import React from 'react'

export function DiscoveryView({ kind }: { kind: DiscoveryPages }) {
  return (
    <DiscoveryWrapperWithIntro>
      <DiscoveryNavigation kind={kind} />
      <DiscoveryControl kind={kind} />
    </DiscoveryWrapperWithIntro>
  )
}
