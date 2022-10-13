import { SidebarOpenGuniVault } from 'apps/main/features/earn/guni/open/sidebars/SidebarOpenGuniVault'
import React from 'react'

import { OpenGuniVaultState } from '../pipes/openGuniVault'

export function GuniOpenMultiplyVaultForm(props: OpenGuniVaultState) {
  return <SidebarOpenGuniVault {...props} />
}
