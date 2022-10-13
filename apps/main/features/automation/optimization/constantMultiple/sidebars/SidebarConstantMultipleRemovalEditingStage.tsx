import { IlkData } from 'apps/main/blockchain/ilks'
import { Vault } from 'apps/main/blockchain/vaults'
import { VaultErrors } from 'apps/main/components/vault/VaultErrors'
import { VaultWarnings } from 'apps/main/components/vault/VaultWarnings'
import { CancelConstantMultipleInfoSection } from 'apps/main/features/automation/optimization/constantMultiple/controls/CancelConstantMultipleInfoSection'
import { ConstantMultipleTriggerData } from 'apps/main/features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { VaultErrorMessage } from 'apps/main/features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'apps/main/features/form/warningMessagesHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface SidebarConstantMultipleRemovalEditingStageProps {
  errors: VaultErrorMessage[]
  ilkData: IlkData
  vault: Vault
  warnings: VaultWarningMessage[]
  constantMultipleTriggerData: ConstantMultipleTriggerData
}

export function SidebarConstantMultipleRemovalEditingStage({
  constantMultipleTriggerData,
  errors,
  ilkData,
  vault,
  warnings,
}: SidebarConstantMultipleRemovalEditingStageProps) {
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('constant-multiple.cancel-instructions')}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={ilkData} />
      <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
      <ConstantMultipleInfoSectionControl
        vault={vault}
        constantMultipleTriggerData={constantMultipleTriggerData}
      />
    </>
  )
}

interface ConstantMultipleInfoSectionControlProps {
  constantMultipleTriggerData: ConstantMultipleTriggerData
  vault: Vault
}

function ConstantMultipleInfoSectionControl({
  constantMultipleTriggerData,
  vault,
}: ConstantMultipleInfoSectionControlProps) {
  return (
    <CancelConstantMultipleInfoSection
      collateralizationRatio={vault.collateralizationRatio}
      liquidationPrice={vault.liquidationPrice}
      constantMultipleTriggerData={constantMultipleTriggerData}
      debt={vault.debt}
    />
  )
}
