import BigNumber from 'bignumber.js'
import { IlkData } from 'apps/main/blockchain/ilks'
import { getToken } from 'apps/main/blockchain/tokensMetadata'
import { collateralPriceAtRatio } from 'apps/main/blockchain/vault.maths'
import { Vault } from 'apps/main/blockchain/vaults'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import { PickCloseStateProps } from 'apps/main/components/dumb/PickCloseState'
import {
  closeVaultOptions,
  DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
} from 'apps/main/features/automation/common/consts'
import { SidebarAutomationStages } from 'apps/main/features/automation/common/types'
import {
  checkIfIsDisabledStopLoss,
  checkIfIsEditingStopLoss,
  getStartingSlRatio,
} from 'apps/main/features/automation/protection/stopLoss/helpers'
import {
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
  StopLossResetData,
} from 'apps/main/features/automation/protection/stopLoss/state/StopLossFormChange'
import { StopLossTriggerData } from 'apps/main/features/automation/protection/stopLoss/state/stopLossTriggerData'

interface GetStopLossStatusParams {
  stopLossTriggerData: StopLossTriggerData
  stopLossState: StopLossFormChange
  isRemoveForm: boolean
  isProgressStage: boolean
  isOwner: boolean
  isAddForm: boolean
  maxDebtForSettingStopLoss: boolean
  vault: Vault
  stage: SidebarAutomationStages
  ilkData: IlkData
}

interface StopLossStatus {
  isEditing: boolean
  isDisabled: boolean
  closePickerConfig: PickCloseStateProps
  resetData: StopLossResetData
  executionPrice: BigNumber
}

export function getStopLossStatus({
  stopLossTriggerData,
  stopLossState,
  isRemoveForm,
  isProgressStage,
  isOwner,
  isAddForm,
  maxDebtForSettingStopLoss,
  vault,
  stage,
  ilkData,
}: GetStopLossStatusParams): StopLossStatus {
  const { uiChanges } = useAppContext()

  const isEditing = checkIfIsEditingStopLoss({
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    selectedSLValue: stopLossState.stopLossLevel,
    stopLossLevel: stopLossTriggerData.stopLossLevel,
    collateralActive: stopLossState.collateralActive,
    isToCollateral: stopLossTriggerData.isToCollateral,
    isRemoveForm,
  })
  const isDisabled = checkIfIsDisabledStopLoss({
    isAddForm,
    isEditing,
    isOwner,
    isProgressStage,
    maxDebtForSettingStopLoss,
    stage,
  })

  const sliderMin = ilkData.liquidationRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.div(100))
  const selectedStopLossCollRatioIfTriggerDoesntExist = sliderMin.plus(
    DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE,
  )
  const initialSlRatioWhenTriggerDoesntExist = getStartingSlRatio({
    stopLossLevel: stopLossTriggerData.stopLossLevel,
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    initialStopLossSelected: selectedStopLossCollRatioIfTriggerDoesntExist,
  })
    .times(100)
    .decimalPlaces(0, BigNumber.ROUND_DOWN)
  const resetData: StopLossResetData = {
    stopLossLevel: initialSlRatioWhenTriggerDoesntExist,
    collateralActive: stopLossTriggerData.isToCollateral,
    txDetails: {},
  }

  const executionPrice = collateralPriceAtRatio({
    colRatio: stopLossState.stopLossLevel.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })
  const closePickerConfig = {
    optionNames: closeVaultOptions,
    onclickHandler: (optionName: string) => {
      uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
        type: 'close-type',
        toCollateral: optionName === closeVaultOptions[0],
      })
    },
    isCollateralActive: stopLossState.collateralActive,
    collateralTokenSymbol: vault.token,
    collateralTokenIconCircle: getToken(vault.token).iconCircle, // Isn't this icon redundant? ~Ł
  }

  return {
    isEditing,
    isDisabled,
    resetData,
    closePickerConfig,
    executionPrice,
  }
}
