import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio } from 'apps/main/blockchain/vault.maths'
import { Vault } from 'apps/main/blockchain/vaults'
import {
  checkIfIsDisabledAutoBS,
  checkIfIsEditingAutoBS,
  getAutoBSVaultChange,
  prepareAutoBSResetData,
} from 'apps/main/features/automation/common/helpers'
import { AutoBSFormChange } from 'apps/main/features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'apps/main/features/automation/common/state/autoBSTriggerData'
import { AutomationBSPublishType, SidebarAutomationStages } from 'apps/main/features/automation/common/types'

interface GetAutoBSStatusParams {
  autoBSState: AutoBSFormChange
  autoBSTriggerData: AutoBSTriggerData
  isRemoveForm: boolean
  isProgressStage: boolean
  isOwner: boolean
  isAddForm: boolean
  publishType: AutomationBSPublishType
  stage: SidebarAutomationStages
  vault: Vault
}

interface AutoBSStatus {
  collateralDelta: BigNumber
  debtDelta: BigNumber
  debtDeltaAtCurrentCollRatio: BigNumber
  executionPrice: BigNumber
  executionPriceAtCurrentCollRatio: BigNumber
  isDisabled: boolean
  isEditing: boolean
  resetData: any
}

export function getAutoBSStatus({
  autoBSState,
  autoBSTriggerData,
  isAddForm,
  isOwner,
  isProgressStage,
  isRemoveForm,
  publishType,
  stage,
  vault,
}: GetAutoBSStatusParams): AutoBSStatus {
  const isEditing = checkIfIsEditingAutoBS({
    autoBSTriggerData,
    autoBSState,
    isRemoveForm,
  })
  const isDisabled = checkIfIsDisabledAutoBS({
    isProgressStage,
    isOwner,
    isEditing,
    isAddForm,
    autoBSState,
    stage,
  })
  const executionPrice = collateralPriceAtRatio({
    colRatio: autoBSState.execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })
  const executionPriceAtCurrentCollRatio = collateralPriceAtRatio({
    colRatio: vault.collateralizationRatio,
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })
  const { debtDelta, collateralDelta } = getAutoBSVaultChange({
    targetCollRatio: autoBSState.targetCollRatio,
    execCollRatio: autoBSState.execCollRatio,
    deviation: autoBSState.deviation,
    executionPrice,
    lockedCollateral: vault.lockedCollateral,
    debt: vault.debt,
  })
  const { debtDelta: debtDeltaAtCurrentCollRatio } = getAutoBSVaultChange({
    targetCollRatio: autoBSState.targetCollRatio,
    execCollRatio: vault.collateralizationRatio.times(100),
    deviation: autoBSState.deviation,
    executionPrice: executionPriceAtCurrentCollRatio,
    lockedCollateral: vault.lockedCollateral,
    debt: vault.debt,
  })
  const resetData = prepareAutoBSResetData(
    autoBSTriggerData,
    vault.collateralizationRatio,
    publishType,
  )

  return {
    collateralDelta,
    debtDelta,
    debtDeltaAtCurrentCollRatio,
    executionPrice,
    executionPriceAtCurrentCollRatio,
    isDisabled,
    isEditing,
    resetData,
  }
}
