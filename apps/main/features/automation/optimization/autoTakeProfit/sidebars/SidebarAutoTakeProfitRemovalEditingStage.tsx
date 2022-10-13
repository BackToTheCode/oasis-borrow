import { IlkData } from 'apps/main/blockchain/ilks'
import { amountFromWei } from 'apps/main/blockchain/utils'
import { Vault } from 'apps/main/blockchain/vaults'
import { VaultErrors } from 'apps/main/components/vault/VaultErrors'
import { VaultWarnings } from 'apps/main/components/vault/VaultWarnings'
import { CancelAutoTakeProfitInfoSection } from 'apps/main/features/automation/optimization/autoTakeProfit/controls/CancelAutoTakeProfitInfoSection'
import { AutoTakeProfitTriggerData } from 'apps/main/features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { VaultErrorMessage } from 'apps/main/features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'apps/main/features/form/warningMessagesHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface SidebarAutoTakeProfitRemovalEditingStageProps {
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  errors: VaultErrorMessage[]
  ilkData: IlkData
  vault: Vault
  warnings: VaultWarningMessage[]
}

export function SidebarAutoTakeProfitRemovalEditingStage({
  autoTakeProfitTriggerData,
  errors,
  ilkData,
  vault,
  warnings,
}: SidebarAutoTakeProfitRemovalEditingStageProps) {
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('auto-take-profit.cancel-instructions')}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={ilkData} />
      <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
      <AutoTakeProfitInfoSectionControl
        autoTakeProfitTriggerData={autoTakeProfitTriggerData}
        vault={vault}
      />
    </>
  )
}

interface AutoTakeProfitInfoSectionControlProps {
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  vault: Vault
}

function AutoTakeProfitInfoSectionControl({
  autoTakeProfitTriggerData,
  vault,
}: AutoTakeProfitInfoSectionControlProps) {
  return (
    <CancelAutoTakeProfitInfoSection
      collateralizationRatio={vault.collateralizationRatio.times(100)}
      token={vault.token}
      triggerColPrice={amountFromWei(autoTakeProfitTriggerData.executionPrice, vault.token)}
    />
  )
}
