import { TxStatus } from '@oasisdex/transactions'
import { AutomationBotAddAggregatorTriggerData } from 'apps/main/blockchain/calls/automationBotAggregator'
import { maxUint256 } from 'apps/main/blockchain/calls/erc20'
import { Vault } from 'apps/main/blockchain/vaults'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import { AutoBSTriggerData } from 'apps/main/features/automation/common/state/autoBSTriggerData'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleFormChange,
} from 'apps/main/features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import { ConstantMultipleTriggerData } from 'apps/main/features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { prepareAddConstantMultipleTriggerData } from 'apps/main/features/automation/optimization/constantMultiple/state/constantMultipleTriggersData'
import { zero } from 'apps/main/helpers/zero'
import { useMemo } from 'react'

interface GetConstantMultipleTxHandlersParams {
  autoBuyTriggerData: AutoBSTriggerData
  autoSellTriggerData: AutoBSTriggerData
  constantMultipleState: ConstantMultipleFormChange
  constantMultipleTriggerData: ConstantMultipleTriggerData
  isAddForm: boolean
  vault: Vault
}

interface ConstantMultipleTxHandlers {
  addTxData: AutomationBotAddAggregatorTriggerData
  textButtonHandlerExtension: () => void
  txStatus?: TxStatus
}

export function getConstantMultipleTxHandlers({
  autoBuyTriggerData,
  autoSellTriggerData,
  constantMultipleState,
  constantMultipleTriggerData,
  isAddForm,
  vault,
}: GetConstantMultipleTxHandlersParams): ConstantMultipleTxHandlers {
  const { uiChanges } = useAppContext()

  const addTxData = useMemo(
    () =>
      prepareAddConstantMultipleTriggerData({
        triggersId: constantMultipleTriggerData.triggersId,
        autoBuyTriggerId: autoBuyTriggerData.triggerId,
        autoSellTriggerId: autoSellTriggerData.triggerId,
        vaultData: vault,
        maxBuyPrice: constantMultipleState.buyWithThreshold
          ? constantMultipleState.maxBuyPrice || maxUint256
          : maxUint256,
        minSellPrice: constantMultipleState.sellWithThreshold
          ? constantMultipleState.minSellPrice || zero
          : zero,
        buyExecutionCollRatio: constantMultipleState.buyExecutionCollRatio,
        sellExecutionCollRatio: constantMultipleState.sellExecutionCollRatio,
        targetCollRatio: constantMultipleState.targetCollRatio, // TODO calculate using constantMultipleState.multiplier
        continuous: constantMultipleState.continuous,
        deviation: constantMultipleState.deviation,
        maxBaseFeeInGwei: constantMultipleState.maxBaseFeeInGwei,
      }),
    [
      constantMultipleTriggerData.triggersId,
      vault.collateralizationRatio.toNumber(),
      constantMultipleState.maxBuyPrice?.toNumber(),
      constantMultipleState.minSellPrice?.toNumber(),
      constantMultipleState.buyExecutionCollRatio?.toNumber(),
      constantMultipleState.sellExecutionCollRatio?.toNumber(),
      constantMultipleState.buyWithThreshold,
      constantMultipleState.sellWithThreshold,
      constantMultipleState.targetCollRatio.toNumber(),
      constantMultipleState.continuous,
      constantMultipleState.deviation?.toNumber(),
      constantMultipleState.maxBaseFeeInGwei?.toNumber(),
    ],
  )

  function textButtonHandlerExtension() {
    if (isAddForm) {
      uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
        type: 'multiplier',
        multiplier: 0,
      })
      uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
        type: 'sell-execution-coll-ratio',
        sellExecutionCollRatio: zero,
      })
      uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
        type: 'buy-execution-coll-ratio',
        buyExecutionCollRatio: zero,
      })
    }
  }

  return {
    addTxData,
    textButtonHandlerExtension,
  }
}
