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

interface SidebarAutoBuyRemovalEditingStageProps {
  vault: Vault
  ilkData: IlkData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  autoBuyState: AutoBSFormChange
}

export function SidebarAutoBuyRemovalEditingStage({
  vault,
  ilkData,
  errors,
  warnings,
  autoBuyState,
}: SidebarAutoBuyRemovalEditingStageProps) {
  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        To cancel the Auto-Buy you’ll need to click the button below and confirm the transaction.
      </Text>
      <VaultErrors errorMessages={errors} ilkData={ilkData} />
      <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
      <AutoBuyInfoSectionControl vault={vault} autoBuyState={autoBuyState} />
    </>
  )
}

interface AutoBuyInfoSectionControlProps {
  vault: Vault
  autoBuyState: AutoBSFormChange
}

function AutoBuyInfoSectionControl({ vault, autoBuyState }: AutoBuyInfoSectionControlProps) {
  const { t } = useTranslation()
  return (
    <CancelAutoBSInfoSection
      collateralizationRatio={vault.collateralizationRatio}
      liquidationPrice={vault.liquidationPrice}
      title={t('auto-buy.cancel-summary-title')}
      autoBSState={autoBuyState}
      debt={vault.debt}
    />
  )
}
