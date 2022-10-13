import { collateralPriceAtRatio } from 'apps/main/blockchain/vault.maths'
import { Vault } from 'apps/main/blockchain/vaults'
import { checkIfIsEditingAutoBS } from 'apps/main/features/automation/common/helpers'
import {
  AUTO_BUY_FORM_CHANGE,
  AutoBSFormChange,
} from 'apps/main/features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'apps/main/features/automation/common/state/autoBSTriggerData'
import { AutoBuyDetailsLayout } from 'apps/main/features/automation/optimization/autoBuy/controls/AutoBuyDetailsLayout'
import { useUIChanges } from 'apps/main/helpers/uiChangesHook'
import { useFeatureToggle } from 'apps/main/helpers/useFeatureToggle'
import React from 'react'

interface AutoBuyDetailsControlProps {
  vault: Vault
  autoBuyTriggerData: AutoBSTriggerData
  isconstantMultipleEnabled: boolean
}

export function AutoBuyDetailsControl({
  vault,
  autoBuyTriggerData,
  isconstantMultipleEnabled,
}: AutoBuyDetailsControlProps) {
  const readOnlyAutoBSEnabled = useFeatureToggle('ReadOnlyBasicBS')

  const [autoBuyState] = useUIChanges<AutoBSFormChange>(AUTO_BUY_FORM_CHANGE)

  const {
    execCollRatio,
    targetCollRatio,
    maxBuyOrMinSellPrice,
    isTriggerEnabled,
  } = autoBuyTriggerData
  const isDebtZero = vault.debt.isZero()

  const executionPrice = collateralPriceAtRatio({
    colRatio: autoBuyTriggerData.execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })
  const isEditing = checkIfIsEditingAutoBS({
    autoBSTriggerData: autoBuyTriggerData,
    autoBSState: autoBuyState,
    isRemoveForm: autoBuyState.currentForm === 'remove',
  })

  const autoBuyDetailsLayoutOptionalParams = {
    ...(isTriggerEnabled && {
      triggerColRatio: execCollRatio,
      nextBuyPrice: executionPrice,
      targetColRatio: targetCollRatio,
      threshold: maxBuyOrMinSellPrice,
    }),
    ...(isEditing && {
      afterTriggerColRatio: autoBuyState.execCollRatio,
      afterTargetColRatio: autoBuyState.targetCollRatio,
    }),
  }

  if (readOnlyAutoBSEnabled || isDebtZero) return null

  return (
    <AutoBuyDetailsLayout
      token={vault.token}
      autoBuyTriggerData={autoBuyTriggerData}
      isconstantMultipleEnabled={isconstantMultipleEnabled}
      {...autoBuyDetailsLayoutOptionalParams}
    />
  )
}
