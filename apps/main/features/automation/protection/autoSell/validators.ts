import BigNumber from 'bignumber.js'
import { IlkData } from 'apps/main/blockchain/ilks'
import { Vault } from 'apps/main/blockchain/vaults'
import { MIX_MAX_COL_RATIO_TRIGGER_OFFSET } from 'apps/main/features/automation/common/consts'
import { AutoBSFormChange } from 'apps/main/features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'apps/main/features/automation/common/state/autoBSTriggerData'
import { ConstantMultipleTriggerData } from 'apps/main/features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'apps/main/features/form/commonValidators'
import { errorMessagesHandler } from 'apps/main/features/form/errorMessagesHandler'
import { warningMessagesHandler } from 'apps/main/features/form/warningMessagesHandler'
import { zero } from 'apps/main/helpers/zero'

export function warningsAutoSellValidation({
  vault,
  gasEstimationUsd,
  ethBalance,
  ethPrice,
  sliderMin,
  sliderMax,
  minSellPrice,
  isStopLossEnabled,
  isAutoBuyEnabled,
  autoSellState,
  debtDeltaAtCurrentCollRatio,
  debtFloor,
}: {
  vault: Vault
  ethBalance: BigNumber
  ethPrice: BigNumber
  sliderMin: BigNumber
  sliderMax: BigNumber
  gasEstimationUsd?: BigNumber
  isStopLossEnabled: boolean
  isAutoBuyEnabled: boolean
  autoSellState: AutoBSFormChange
  minSellPrice?: BigNumber
  debtDeltaAtCurrentCollRatio: BigNumber
  debtFloor: BigNumber
}) {
  const potentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    token: vault.token,
    gasEstimationUsd,
    ethBalance,
    ethPrice,
  })
  const noMinSellPriceWhenStopLossEnabled =
    (minSellPrice?.isZero() || !minSellPrice) && isStopLossEnabled

  const autoSellTriggerCloseToStopLossTrigger =
    isStopLossEnabled && autoSellState.execCollRatio.isEqualTo(sliderMin)
  const autoSellTargetCloseToAutoBuyTrigger =
    isAutoBuyEnabled && autoSellState.targetCollRatio.isEqualTo(sliderMax)

  const autoSellTriggeredImmediately =
    autoSellState.execCollRatio.div(100).gte(vault.collateralizationRatioAtNextPrice) &&
    !debtFloor.gt(vault.debt.plus(debtDeltaAtCurrentCollRatio))

  return warningMessagesHandler({
    potentialInsufficientEthFundsForTx,
    noMinSellPriceWhenStopLossEnabled,
    autoSellTriggerCloseToStopLossTrigger,
    autoSellTargetCloseToAutoBuyTrigger,
    autoSellTriggeredImmediately,
  })
}

export function errorsAutoSellValidation({
  vault,
  ilkData,
  debtDelta,
  executionPrice,
  debtDeltaAtCurrentCollRatio,
  isRemoveForm,
  autoSellState,
  autoBuyTriggerData,
  constantMultipleTriggerData,
}: {
  vault: Vault
  ilkData: IlkData
  debtDelta: BigNumber
  executionPrice: BigNumber
  debtDeltaAtCurrentCollRatio: BigNumber
  isRemoveForm: boolean
  autoSellState: AutoBSFormChange
  autoBuyTriggerData: AutoBSTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
}) {
  const {
    execCollRatio,
    targetCollRatio,
    withThreshold,
    maxBuyOrMinSellPrice,
    txDetails,
  } = autoSellState
  const insufficientEthFundsForTx = ethFundsForTxValidator({
    txError: txDetails?.txError,
  })
  const targetCollRatioExceededDustLimitCollRatio =
    !targetCollRatio.isZero() &&
    (ilkData.debtFloor.gt(vault.debt.plus(debtDelta)) ||
      ilkData.debtFloor.gt(vault.debt.plus(debtDeltaAtCurrentCollRatio)))

  const minimumSellPriceNotProvided =
    !isRemoveForm && withThreshold && (!maxBuyOrMinSellPrice || maxBuyOrMinSellPrice.isZero())

  const autoSellTriggerHigherThanAutoBuyTarget =
    autoBuyTriggerData.isTriggerEnabled &&
    execCollRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET).gt(autoBuyTriggerData.targetCollRatio)

  const cantSetupAutoBuyOrSellWhenConstantMultipleEnabled =
    constantMultipleTriggerData.isTriggerEnabled

  const minSellPriceWillPreventSellTrigger =
    maxBuyOrMinSellPrice?.gt(zero) && maxBuyOrMinSellPrice.gt(executionPrice)

  return errorMessagesHandler({
    insufficientEthFundsForTx,
    targetCollRatioExceededDustLimitCollRatio,
    minimumSellPriceNotProvided,
    autoSellTriggerHigherThanAutoBuyTarget,
    cantSetupAutoBuyOrSellWhenConstantMultipleEnabled,
    minSellPriceWillPreventSellTrigger,
  })
}
