import BigNumber from 'bignumber.js'
import { AutomationBotAddTriggerData } from 'apps/main/blockchain/calls/automationBot'
import {
  AutomationBotAddAggregatorTriggerData,
  removeAutomationBotAggregatorTriggers,
} from 'apps/main/blockchain/calls/automationBotAggregator'
import { TxHelpers } from 'apps/main/components/AppContext'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import { AutoBSTriggerResetData } from 'apps/main/features/automation/common/state/autoBSFormChange'
import { getAutomationFeatureTxHandlers } from 'apps/main/features/automation/common/state/automationFeatureTxHandlers'
import { AutomationPublishType, SidebarAutomationStages } from 'apps/main/features/automation/common/types'
import { AutoTakeProfitResetData } from 'apps/main/features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { StopLossResetData } from 'apps/main/features/automation/protection/stopLoss/state/StopLossFormChange'
import { addTransactionMap, TX_DATA_CHANGE } from 'apps/main/helpers/gasEstimate'
import { ReactElement, useEffect } from 'react'

export interface AddAndRemoveTxHandler {
  callOnSuccess?: () => void
}

interface AddAndRemoveTriggerControlProps {
  addTxData: AutomationBotAddTriggerData | AutomationBotAddAggregatorTriggerData
  ethMarketPrice: BigNumber
  isActiveFlag: boolean
  isAddForm: boolean
  isEditing: boolean
  isRemoveForm: boolean
  proxyAddress: string
  publishType: AutomationPublishType
  resetData: StopLossResetData | AutoTakeProfitResetData | AutoBSTriggerResetData
  shouldRemoveAllowance: boolean
  stage: SidebarAutomationStages
  textButtonHandlerExtension?: () => void
  triggersId: number[]
  txHelpers?: TxHelpers
  children: (
    txHandler: (options?: AddAndRemoveTxHandler) => void,
    textButtonHandler: () => void,
  ) => ReactElement
}

export function AddAndRemoveTriggerControl({
  addTxData,
  children,
  ethMarketPrice,
  isActiveFlag,
  isAddForm,
  isEditing,
  isRemoveForm,
  proxyAddress,
  publishType,
  resetData,
  shouldRemoveAllowance,
  stage,
  textButtonHandlerExtension,
  triggersId,
  txHelpers,
}: AddAndRemoveTriggerControlProps) {
  const { uiChanges } = useAppContext()

  const { removeTxData, textButtonHandler, txHandler } = getAutomationFeatureTxHandlers({
    addTxData,
    ethMarketPrice,
    isAddForm,
    isRemoveForm,
    proxyAddress,
    publishType,
    resetData,
    shouldRemoveAllowance,
    stage,
    textButtonHandlerExtension,
    triggersId,
    txHelpers,
  })

  useEffect(() => {
    if (isActiveFlag && isEditing) {
      if (isAddForm) {
        uiChanges.publish(TX_DATA_CHANGE, {
          type: 'add-trigger',
          transaction: addTransactionMap[publishType],
          data: addTxData,
        })
      }
      if (isRemoveForm) {
        uiChanges.publish(TX_DATA_CHANGE, {
          type: 'remove-triggers',
          transaction: removeAutomationBotAggregatorTriggers,
          data: removeTxData,
        })
      }
    }
  }, [addTxData, removeTxData, isActiveFlag])

  return children(textButtonHandler, txHandler)
}
