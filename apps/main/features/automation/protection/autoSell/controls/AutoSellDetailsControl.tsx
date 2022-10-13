import { collateralPriceAtRatio } from 'apps/main/blockchain/vault.maths'
import { Vault } from 'apps/main/blockchain/vaults'
import { checkIfIsEditingAutoBS } from 'apps/main/features/automation/common/helpers'
import {
  AUTO_SELL_FORM_CHANGE,
  AutoBSFormChange,
} from 'apps/main/features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'apps/main/features/automation/common/state/autoBSTriggerData'
import { AutoSellDetailsLayout } from 'apps/main/features/automation/protection/autoSell/controls/AutoSellDetailsLayout'
import { useUIChanges } from 'apps/main/helpers/uiChangesHook'
import { useFeatureToggle } from 'apps/main/helpers/useFeatureToggle'
import React from 'react'

interface AutoSellDetailsControlProps {
  vault: Vault
  autoSellTriggerData: AutoBSTriggerData
  isAutoSellActive: boolean
  isconstantMultipleEnabled: boolean
}

export function AutoSellDetailsControl({
  vault,
  autoSellTriggerData,
  isconstantMultipleEnabled,
}: AutoSellDetailsControlProps) {
  const readOnlyAutoBSEnabled = useFeatureToggle('ReadOnlyBasicBS')

  const [autoSellState] = useUIChanges<AutoBSFormChange>(AUTO_SELL_FORM_CHANGE)

  const {
    execCollRatio,
    targetCollRatio,
    maxBuyOrMinSellPrice,
    isTriggerEnabled,
  } = autoSellTriggerData
  const isDebtZero = vault.debt.isZero()

  const executionPrice = collateralPriceAtRatio({
    colRatio: execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })
  const isEditing = checkIfIsEditingAutoBS({
    autoBSTriggerData: autoSellTriggerData,
    autoBSState: autoSellState,
    isRemoveForm: autoSellState.currentForm === 'remove',
  })

  const autoSellDetailsLayoutOptionalParams = {
    ...(isTriggerEnabled && {
      triggerColRatio: execCollRatio,
      nextSellPrice: executionPrice,
      targetColRatio: targetCollRatio,
      threshold: maxBuyOrMinSellPrice,
    }),
    ...(isEditing && {
      afterTriggerColRatio: autoSellState.execCollRatio,
      afterTargetColRatio: autoSellState.targetCollRatio,
    }),
  }

  if (readOnlyAutoBSEnabled || isDebtZero) return null

  return (
    <AutoSellDetailsLayout
      token={vault.token}
      autoSellTriggerData={autoSellTriggerData}
      isconstantMultipleEnabled={isconstantMultipleEnabled}
      {...autoSellDetailsLayoutOptionalParams}
    />
  )
}
