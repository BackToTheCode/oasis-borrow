import { AutoTakeProfitFormChange } from 'apps/main/features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { AutoTakeProfitTriggerData } from 'apps/main/features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { SidebarVaultStages } from 'apps/main/features/types/vaults/sidebarLabels'

export function checkIfIsEditingAutoTakeProfit({
  autoTakeProfitState,
  autoTakeProfitTriggerData,
  isRemoveForm,
}: {
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  autoTakeProfitState: AutoTakeProfitFormChange
  isRemoveForm: boolean
}) {
  return (
    (!autoTakeProfitTriggerData.isTriggerEnabled && autoTakeProfitState.isEditing) ||
    (autoTakeProfitTriggerData.isTriggerEnabled &&
      (autoTakeProfitTriggerData.isToCollateral !== autoTakeProfitState.toCollateral ||
        !autoTakeProfitTriggerData.executionPrice.isEqualTo(autoTakeProfitState.executionPrice))) ||
    isRemoveForm
  )
}

export function checkIfIsDisabledAutoTakeProfit({
  isEditing,
  isOwner,
  isProgressStage,
  stage,
}: {
  isEditing: boolean
  isOwner: boolean
  isProgressStage?: boolean
  stage: SidebarVaultStages
}) {
  return (isProgressStage || !isOwner || !isEditing) && stage !== 'txSuccess'
}
