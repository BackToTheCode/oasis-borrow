import { IlkData } from 'apps/main/blockchain/ilks'
import { Vault } from 'apps/main/blockchain/vaults'
import { VaultErrors } from 'apps/main/components/vault/VaultErrors'
import { VaultWarnings } from 'apps/main/components/vault/VaultWarnings'
import { CancelAutoBSInfoSection } from 'apps/main/features/automation/common/sidebars/CancelAutoBSInfoSection'
import { AutoBSFormChange } from 'apps/main/features/automation/common/state/autoBSFormChange'
import { VaultErrorMessage } from 'apps/main/features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'apps/main/features/form/warningMessagesHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface AutoSellInfoSectionControlProps {
  vault: Vault
  autoSellState: AutoBSFormChange
}

function AutoSellInfoSectionControl({ vault, autoSellState }: AutoSellInfoSectionControlProps) {
  const { t } = useTranslation()
  return (
    <CancelAutoBSInfoSection
      collateralizationRatio={vault.collateralizationRatio}
      liquidationPrice={vault.liquidationPrice}
      debt={vault.debt}
      title={t('auto-sell.cancel-summary-title')}
      autoBSState={autoSellState}
    />
  )
}

interface SidebarAutoSellCancelEditingStageProps {
  vault: Vault
  ilkData: IlkData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  autoSellState: AutoBSFormChange
}

export function SidebarAutoSellCancelEditingStage({
  vault,
  ilkData,
  errors,
  warnings,
  autoSellState,
}: SidebarAutoSellCancelEditingStageProps) {
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('auto-sell.cancel-summary-description')}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={ilkData} />
      <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
      <AutoSellInfoSectionControl vault={vault} autoSellState={autoSellState} />
    </>
  )
}
