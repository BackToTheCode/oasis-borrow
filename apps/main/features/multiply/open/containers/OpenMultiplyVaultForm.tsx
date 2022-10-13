import { SidebarOpenMultiplyVault } from 'apps/main/features/multiply/open/sidebars/SidebarOpenMultiplyVault'
import React from 'react'

import { OpenMultiplyVaultState } from '../pipes/openMultiplyVault'

export function OpenMultiplyVaultForm(props: OpenMultiplyVaultState) {
  return <SidebarOpenMultiplyVault {...props} />
}
