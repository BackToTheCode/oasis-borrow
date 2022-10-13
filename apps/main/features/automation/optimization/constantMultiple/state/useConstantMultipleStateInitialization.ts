import { IlkData } from 'apps/main/blockchain/ilks'
import { InstiVault } from 'apps/main/blockchain/instiVault'
import { Vault } from 'apps/main/blockchain/vaults'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import { calculateCollRatioFromMultiple } from 'apps/main/features/automation/common/helpers'
import { AutoBSTriggerData } from 'apps/main/features/automation/common/state/autoBSTriggerData'
import {
  getConstantMultipleMultipliers,
  getDefaultMultiplier,
} from 'apps/main/features/automation/optimization/common/multipliers'
import {
  getConstantMutliplyMinMaxValues,
  getEligibleMultipliers,
} from 'apps/main/features/automation/optimization/constantMultiple/helpers'
import { CONSTANT_MULTIPLE_FORM_CHANGE } from 'apps/main/features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import {
  ConstantMultipleTriggerData,
  prepareConstantMultipleResetData,
} from 'apps/main/features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { StopLossTriggerData } from 'apps/main/features/automation/protection/stopLoss/state/stopLossTriggerData'
import { useEffect } from 'react'

export const CONSTANT_MULTIPLE_GROUP_TYPE = 1

export const DEFAULT_TARGET_OFFSET = 10

export function useConstantMultipleStateInitialization(
  ilkData: IlkData,
  vault: Vault | InstiVault,
  constantMultipleTriggerData: ConstantMultipleTriggerData,
  autoBuyTriggerData: AutoBSTriggerData,
  autoSellTriggerData: AutoBSTriggerData,
  stopLossTriggerData: StopLossTriggerData,
) {
  const { uiChanges } = useAppContext()

  const collateralizationRatio = vault.collateralizationRatio.toNumber()

  const { min, max } = getConstantMutliplyMinMaxValues({
    autoBuyTriggerData,
    stopLossTriggerData,
    ilkData,
  })

  const multipliers = getConstantMultipleMultipliers({
    ilk: ilkData.ilk,
    minColRatio: min,
    maxColRatio: max,
  })

  const eligibleMultipliers = getEligibleMultipliers({
    multipliers,
    collateralizationRatio: vault.collateralizationRatio,
    lockedCollateral: vault.lockedCollateral,
    debt: vault.debt,
    debtFloor: ilkData.debtFloor,
    deviation: constantMultipleTriggerData.deviation,
    minTargetRatio: min,
    maxTargetRatio: max,
  })

  const defaultMultiplier =
    getDefaultMultiplier({
      multipliers: eligibleMultipliers,
      minColRatio: min,
      maxColRatio: max,
    }) || multipliers[0] // fallback to not break data preparation

  const defaultCollRatio = calculateCollRatioFromMultiple(defaultMultiplier)

  useEffect(() => {
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'form-defaults',
      multipliers,
      defaultMultiplier,
      eligibleMultipliers,
      defaultCollRatio,
      minTargetRatio: min,
      maxTargetRatio: max,
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'is-reset-action',
      isResetAction: false,
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'reset',
      resetData: prepareConstantMultipleResetData({
        defaultMultiplier,
        defaultCollRatio,
        constantMultipleTriggerData,
      }),
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'continuous',
      continuous: constantMultipleTriggerData.continuous,
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'deviation',
      deviation: constantMultipleTriggerData.deviation,
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'current-form',
      currentForm: 'add',
    })
  }, [
    collateralizationRatio,
    stopLossTriggerData.triggerId.toNumber(),
    autoBuyTriggerData.triggerId.toNumber(),
    autoSellTriggerData.triggerId.toNumber(),
  ])

  return constantMultipleTriggerData.isTriggerEnabled
}
