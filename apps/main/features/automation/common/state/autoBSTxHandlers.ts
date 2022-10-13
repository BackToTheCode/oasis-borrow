import { TxStatus } from '@oasisdex/transactions'
import { AutomationBotAddTriggerData } from 'apps/main/blockchain/calls/automationBot'
import { Vault } from 'apps/main/blockchain/vaults'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import { AutoBSFormChange } from 'apps/main/features/automation/common/state/autoBSFormChange'
import { prepareAddAutoBSTriggerData } from 'apps/main/features/automation/common/state/autoBSTriggerData'
import { AutoBSTriggerTypes, AutomationBSPublishType } from 'apps/main/features/automation/common/types'
import { zero } from 'apps/main/helpers/zero'
import { useMemo } from 'react'

interface GetAutoBSTxHandlersParams {
  autoBSState: AutoBSFormChange
  isAddForm: boolean
  publishType: AutomationBSPublishType
  triggerType: AutoBSTriggerTypes
  vault: Vault
}

interface AutoBSTxHandlers {
  addTxData: AutomationBotAddTriggerData
  textButtonHandlerExtension: () => void
  txStatus?: TxStatus
}

export function getAutoBSTxHandlers({
  autoBSState,
  isAddForm,
  publishType,
  triggerType,
  vault,
}: GetAutoBSTxHandlersParams): AutoBSTxHandlers {
  const { uiChanges } = useAppContext()

  const addTxData = useMemo(
    () =>
      prepareAddAutoBSTriggerData({
        vaultData: vault,
        triggerType,
        execCollRatio: autoBSState.execCollRatio,
        targetCollRatio: autoBSState.targetCollRatio,
        maxBuyOrMinSellPrice: autoBSState.withThreshold
          ? autoBSState.maxBuyOrMinSellPrice || zero
          : zero,
        continuous: autoBSState.continuous,
        deviation: autoBSState.deviation,
        replacedTriggerId: autoBSState.triggerId,
        maxBaseFeeInGwei: autoBSState.maxBaseFeeInGwei,
      }),
    [
      autoBSState.execCollRatio.toNumber(),
      autoBSState.targetCollRatio.toNumber(),
      autoBSState.maxBuyOrMinSellPrice?.toNumber(),
      autoBSState.triggerId.toNumber(),
      autoBSState.maxBaseFeeInGwei.toNumber(),
      vault.collateralizationRatio.toNumber(),
    ],
  )

  function textButtonHandlerExtension() {
    if (isAddForm) {
      uiChanges.publish(publishType, {
        type: 'execution-coll-ratio',
        execCollRatio: zero,
      })
      uiChanges.publish(publishType, {
        type: 'target-coll-ratio',
        targetCollRatio: zero,
      })
    }
  }

  return {
    addTxData,
    textButtonHandlerExtension,
  }
}
