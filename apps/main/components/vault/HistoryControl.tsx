import { DefaultVaultLayout } from 'apps/main/components/vault/DefaultVaultLayout'
import { VaultHistoryEvent } from 'apps/main/features/vaultHistory/vaultHistory'
import { VaultHistoryView } from 'apps/main/features/vaultHistory/VaultHistoryView'
import React from 'react'

interface HistoryControlProps {
  vaultHistory: VaultHistoryEvent[]
}

export function HistoryControl({ vaultHistory }: HistoryControlProps) {
  return (
    <DefaultVaultLayout detailsViewControl={<VaultHistoryView vaultHistory={vaultHistory} />} />
  )
}
