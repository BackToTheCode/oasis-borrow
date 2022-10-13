import { TxStatus } from '@oasisdex/transactions'
import { AutomationBotAddTriggerData } from 'apps/main/blockchain/calls/automationBot'
import { Vault } from 'apps/main/blockchain/vaults'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import {
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
} from 'apps/main/features/automation/protection/stopLoss/state/StopLossFormChange'
import {
  prepareAddStopLossTriggerData,
  StopLossTriggerData,
} from 'apps/main/features/automation/protection/stopLoss/state/stopLossTriggerData'
import { zero } from 'apps/main/helpers/zero'
import { useMemo } from 'react'

interface GetStopLossTxHandlersParams {
  stopLossTriggerData: StopLossTriggerData
  vault: Vault
  stopLossState: StopLossFormChange
  isAddForm: boolean
}

interface StopLossTxHandlers {
  addTxData: AutomationBotAddTriggerData
  textButtonHandlerExtension: () => void
  txStatus?: TxStatus
}

export function getStopLossTxHandlers({
  vault,
  stopLossState,
  stopLossTriggerData,
  isAddForm,
}: GetStopLossTxHandlersParams): StopLossTxHandlers {
  const { uiChanges } = useAppContext()

  const addTxData = useMemo(
    () =>
      prepareAddStopLossTriggerData(
        vault,
        stopLossState.collateralActive,
        stopLossState.stopLossLevel,
        stopLossTriggerData.triggerId.toNumber(),
      ),
    [
      stopLossState.collateralActive,
      stopLossState.stopLossLevel,
      stopLossTriggerData.triggerId.toNumber(),
    ],
  )

  function textButtonHandlerExtension() {
    if (isAddForm) {
      uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
        type: 'stop-loss-level',
        stopLossLevel: zero,
      })
    }
  }

  return {
    addTxData,
    textButtonHandlerExtension,
  }
}
