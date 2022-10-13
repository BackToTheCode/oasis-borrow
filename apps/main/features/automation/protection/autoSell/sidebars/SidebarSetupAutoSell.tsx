import BigNumber from 'bignumber.js'
import { IlkData } from 'apps/main/blockchain/ilks'
import { Context } from 'apps/main/blockchain/network'
import { Vault } from 'apps/main/blockchain/vaults'
import { useGasEstimationContext } from 'apps/main/components/GasEstimationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'apps/main/components/sidebar/SidebarSection'
import { AddAndRemoveTxHandler } from 'apps/main/features/automation/common/controls/AddAndRemoveTriggerControl'
import { getAutoFeaturesSidebarDropdown } from 'apps/main/features/automation/common/sidebars/getAutoFeaturesSidebarDropdown'
import { getAutomationFormFlow } from 'apps/main/features/automation/common/sidebars/getAutomationFormFlow'
import { getAutomationFormTitle } from 'apps/main/features/automation/common/sidebars/getAutomationFormTitle'
import { getAutomationPrimaryButtonLabel } from 'apps/main/features/automation/common/sidebars/getAutomationPrimaryButtonLabel'
import { getAutomationStatusTitle } from 'apps/main/features/automation/common/sidebars/getAutomationStatusTitle'
import { getAutomationTextButtonLabel } from 'apps/main/features/automation/common/sidebars/getAutomationTextButtonLabel'
import { SidebarAutomationFeatureCreationStage } from 'apps/main/features/automation/common/sidebars/SidebarAutomationFeatureCreationStage'
import { AutoBSFormChange } from 'apps/main/features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'apps/main/features/automation/common/state/autoBSTriggerData'
import { AutomationFeatures, SidebarAutomationStages } from 'apps/main/features/automation/common/types'
import { ConstantMultipleTriggerData } from 'apps/main/features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { getAutoSellMinMaxValues } from 'apps/main/features/automation/protection/autoSell/helpers'
import { SidebarAutoSellCancelEditingStage } from 'apps/main/features/automation/protection/autoSell/sidebars/SidebarAuteSellCancelEditingStage'
import { SidebarAutoSellAddEditingStage } from 'apps/main/features/automation/protection/autoSell/sidebars/SidebarAutoSellAddEditingStage'
import {
  errorsAutoSellValidation,
  warningsAutoSellValidation,
} from 'apps/main/features/automation/protection/autoSell/validators'
import { StopLossTriggerData } from 'apps/main/features/automation/protection/stopLoss/state/stopLossTriggerData'
import { BalanceInfo } from 'apps/main/features/shared/balanceInfo'
import { isDropdownDisabled } from 'apps/main/features/sidebar/isDropdownDisabled'
import {
  extractCancelAutomationErrors,
  extractCancelAutomationWarnings,
} from 'apps/main/helpers/messageMappers'
import React from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupAutoSellProps {
  vault: Vault
  ilkData: IlkData
  balanceInfo: BalanceInfo
  autoSellTriggerData: AutoBSTriggerData
  autoBuyTriggerData: AutoBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  isAutoSellActive: boolean
  context: Context
  ethMarketPrice: BigNumber
  autoSellState: AutoBSFormChange
  txHandler: (options?: AddAndRemoveTxHandler) => void
  textButtonHandler: () => void
  stage: SidebarAutomationStages
  isAddForm: boolean
  isRemoveForm: boolean
  isEditing: boolean
  isDisabled: boolean
  isFirstSetup: boolean
  debtDelta: BigNumber
  debtDeltaAtCurrentCollRatio: BigNumber
  collateralDelta: BigNumber
  executionPrice: BigNumber
  feature: AutomationFeatures
}

export function SidebarSetupAutoSell({
  vault,
  ilkData,
  balanceInfo,
  context,
  ethMarketPrice,
  feature,

  autoSellTriggerData,
  autoBuyTriggerData,
  stopLossTriggerData,
  constantMultipleTriggerData,

  isAutoSellActive,
  autoSellState,
  txHandler,
  textButtonHandler,
  stage,

  isAddForm,
  isRemoveForm,
  isEditing,
  isDisabled,
  isFirstSetup,

  debtDelta,
  debtDeltaAtCurrentCollRatio,
  collateralDelta,
  executionPrice,
}: SidebarSetupAutoSellProps) {
  const gasEstimation = useGasEstimationContext()

  const flow = getAutomationFormFlow({ isFirstSetup, isRemoveForm, feature })
  const sidebarTitle = getAutomationFormTitle({
    flow,
    stage,
    feature,
  })
  const dropdown = getAutoFeaturesSidebarDropdown({
    type: 'Protection',
    forcePanel: AutomationFeatures.AUTO_SELL,
    disabled: isDropdownDisabled({ stage }),
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    isAutoSellEnabled: autoSellTriggerData.isTriggerEnabled,
    isAutoConstantMultipleEnabled: constantMultipleTriggerData.isTriggerEnabled,
  })
  const primaryButtonLabel = getAutomationPrimaryButtonLabel({ flow, stage, feature })
  const textButtonLabel = getAutomationTextButtonLabel({ isAddForm })
  const sidebarStatus = getAutomationStatusTitle({
    stage,
    txHash: autoSellState.txDetails?.txHash,
    flow,
    etherscan: context.etherscan.url,
    feature,
  })

  const { min, max } = getAutoSellMinMaxValues({
    autoBuyTriggerData,
    stopLossTriggerData,
    ilkData,
  })

  const warnings = warningsAutoSellValidation({
    vault,
    gasEstimationUsd: gasEstimation?.usdValue,
    ethBalance: balanceInfo.ethBalance,
    ethPrice: ethMarketPrice,
    minSellPrice: autoSellState.maxBuyOrMinSellPrice,
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    isAutoBuyEnabled: autoBuyTriggerData.isTriggerEnabled,
    autoSellState,
    sliderMin: min,
    sliderMax: max,
    debtDeltaAtCurrentCollRatio,
    debtFloor: ilkData.debtFloor,
  })
  const errors = errorsAutoSellValidation({
    ilkData,
    vault,
    debtDelta,
    executionPrice,
    debtDeltaAtCurrentCollRatio,
    autoSellState,
    autoBuyTriggerData,
    constantMultipleTriggerData,
    isRemoveForm,
  })
  const cancelAutoSellWarnings = extractCancelAutomationWarnings(warnings)
  const cancelAutoSellErrors = extractCancelAutomationErrors(errors)
  const validationErrors = isAddForm ? errors : cancelAutoSellErrors

  if (isAutoSellActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: sidebarTitle,
      dropdown,
      content: (
        <Grid gap={3}>
          {(stage === 'editing' || stage === 'txFailure') && (
            <>
              {isAddForm && (
                <SidebarAutoSellAddEditingStage
                  vault={vault}
                  ilkData={ilkData}
                  isEditing={isEditing}
                  autoSellState={autoSellState}
                  autoSellTriggerData={autoSellTriggerData}
                  errors={errors}
                  warnings={warnings}
                  debtDelta={debtDelta}
                  collateralDelta={collateralDelta}
                  sliderMin={min}
                  sliderMax={max}
                  stopLossTriggerData={stopLossTriggerData}
                />
              )}
              {isRemoveForm && (
                <SidebarAutoSellCancelEditingStage
                  vault={vault}
                  ilkData={ilkData}
                  errors={cancelAutoSellErrors}
                  warnings={cancelAutoSellWarnings}
                  autoSellState={autoSellState}
                />
              )}
            </>
          )}
          {(stage === 'txSuccess' || stage === 'txInProgress') && (
            <SidebarAutomationFeatureCreationStage
              featureName={feature}
              stage={stage}
              isAddForm={isAddForm}
              isRemoveForm={isRemoveForm}
            />
          )}
        </Grid>
      ),
      primaryButton: {
        label: primaryButtonLabel,
        disabled: isDisabled || !!validationErrors.length,
        isLoading: stage === 'txInProgress',
        action: () => txHandler(),
      },
      ...(stage !== 'txInProgress' && {
        textButton: {
          label: textButtonLabel,
          hidden: isFirstSetup,
          action: () => textButtonHandler(),
        },
      }),
      status: sidebarStatus,
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}