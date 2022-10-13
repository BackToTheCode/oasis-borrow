import { IlkData } from 'apps/main/blockchain/ilks'
import { InstiVault } from 'apps/main/blockchain/instiVault'
import { Vault } from 'apps/main/blockchain/vaults'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import {
  DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
} from 'apps/main/features/automation/common/consts'
import { getStartingSlRatio } from 'apps/main/features/automation/protection/stopLoss/helpers'
import { STOP_LOSS_FORM_CHANGE } from 'apps/main/features/automation/protection/stopLoss/state/StopLossFormChange'
import { StopLossTriggerData } from 'apps/main/features/automation/protection/stopLoss/state/stopLossTriggerData'
import { zero } from 'apps/main/helpers/zero'
import { useEffect } from 'react'

export function useStopLossStateInitializator(
  ilkData: IlkData,
  vault: Vault | InstiVault,
  stopLossTriggerData: StopLossTriggerData,
) {
  const { uiChanges } = useAppContext()
  const { stopLossLevel, isStopLossEnabled, isToCollateral, triggerId } = stopLossTriggerData
  const collateralizationRatio = vault.collateralizationRatio.toNumber()

  const sliderMin = ilkData.liquidationRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.div(100))
  const selectedStopLossCollRatioIfTriggerDoesntExist = vault.collateralizationRatio.isZero()
    ? zero
    : sliderMin.plus(DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE)
  const initialSelectedSlRatio = getStartingSlRatio({
    stopLossLevel,
    isStopLossEnabled,
    initialStopLossSelected: selectedStopLossCollRatioIfTriggerDoesntExist,
  }).multipliedBy(100)

  useEffect(() => {
    uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
      type: 'close-type',
      toCollateral: isToCollateral,
    })
    uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
      type: 'stop-loss-level',
      stopLossLevel: initialSelectedSlRatio,
    })
  }, [triggerId.toNumber(), collateralizationRatio])

  useEffect(() => {
    uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
      type: 'tx-details',
      txDetails: {},
    })
    uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
      type: 'current-form',
      currentForm: 'add',
    })
  }, [collateralizationRatio])

  return isStopLossEnabled
}
