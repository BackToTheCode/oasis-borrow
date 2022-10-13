import BigNumber from 'bignumber.js'
import { IlkData } from 'apps/main/blockchain/ilks'
import { Context } from 'apps/main/blockchain/network'
import { Vault } from 'apps/main/blockchain/vaults'
import { useGasEstimationContext } from 'apps/main/components/GasEstimationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'apps/main/components/sidebar/SidebarSection'
import { getAutoFeaturesSidebarDropdown } from 'apps/main/features/automation/common/sidebars/getAutoFeaturesSidebarDropdown'
import { getAutomationFormFlow } from 'apps/main/features/automation/common/sidebars/getAutomationFormFlow'
import { getAutomationFormTitle } from 'apps/main/features/automation/common/sidebars/getAutomationFormTitle'
import { getAutomationPrimaryButtonLabel } from 'apps/main/features/automation/common/sidebars/getAutomationPrimaryButtonLabel'
import { getAutomationStatusTitle } from 'apps/main/features/automation/common/sidebars/getAutomationStatusTitle'
import { getAutomationTextButtonLabel } from 'apps/main/features/automation/common/sidebars/getAutomationTextButtonLabel'
import { SidebarAutomationFeatureCreationStage } from 'apps/main/features/automation/common/sidebars/SidebarAutomationFeatureCreationStage'
import { AutoBSTriggerData } from 'apps/main/features/automation/common/state/autoBSTriggerData'
import { AutomationFeatures, SidebarAutomationStages } from 'apps/main/features/automation/common/types'
import { AutoTakeProfitTriggerData } from 'apps/main/features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { SidebarConstantMultipleEditingStage } from 'apps/main/features/automation/optimization/constantMultiple/sidebars/SidebarConstantMultipleEditingStage'
import { SidebarConstantMultipleRemovalEditingStage } from 'apps/main/features/automation/optimization/constantMultiple/sidebars/SidebarConstantMultipleRemovalEditingStage'
import { ConstantMultipleFormChange } from 'apps/main/features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import { ConstantMultipleTriggerData } from 'apps/main/features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import {
  errorsConstantMultipleValidation,
  warningsConstantMultipleValidation,
} from 'apps/main/features/automation/optimization/constantMultiple/validators'
import { StopLossTriggerData } from 'apps/main/features/automation/protection/stopLoss/state/stopLossTriggerData'
import { BalanceInfo } from 'apps/main/features/shared/balanceInfo'
import { isDropdownDisabled } from 'apps/main/features/sidebar/isDropdownDisabled'
import {
  extractCancelAutomationErrors,
  extractCancelAutomationWarnings,
} from 'apps/main/helpers/messageMappers'
import React from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupConstantMultipleProps {
  autoBuyTriggerData: AutoBSTriggerData
  autoSellTriggerData: AutoBSTriggerData
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  balanceInfo: BalanceInfo
  collateralToBePurchased: BigNumber
  collateralToBeSold: BigNumber
  constantMultipleState: ConstantMultipleFormChange
  constantMultipleTriggerData: ConstantMultipleTriggerData
  context: Context
  estimatedBuyFee: BigNumber
  estimatedGasCostOnTrigger?: BigNumber
  estimatedSellFee: BigNumber
  ethMarketPrice: BigNumber
  feature: AutomationFeatures
  ilkData: IlkData
  isAddForm: boolean
  isConstantMultipleActive: boolean
  isDisabled: boolean
  isEditing: boolean
  isFirstSetup: boolean
  isRemoveForm: boolean
  nextBuyPrice: BigNumber
  nextSellPrice: BigNumber
  debtDeltaWhenSellAtCurrentCollRatio: BigNumber
  debtDeltaAfterSell: BigNumber
  stage: SidebarAutomationStages
  stopLossTriggerData: StopLossTriggerData
  textButtonHandler: () => void
  txHandler: () => void
  vault: Vault
}

export function SidebarSetupConstantMultiple({
  autoBuyTriggerData,
  autoSellTriggerData,
  autoTakeProfitTriggerData,
  balanceInfo,
  collateralToBePurchased,
  collateralToBeSold,
  constantMultipleState,
  constantMultipleTriggerData,
  context,
  estimatedBuyFee,
  estimatedGasCostOnTrigger,
  estimatedSellFee,
  ethMarketPrice,
  feature,
  ilkData,
  isAddForm,
  isConstantMultipleActive,
  isDisabled,
  isEditing,
  isFirstSetup,
  isRemoveForm,
  nextBuyPrice,
  nextSellPrice,
  stage,
  stopLossTriggerData,
  textButtonHandler,
  txHandler,
  vault,
  debtDeltaWhenSellAtCurrentCollRatio,
  debtDeltaAfterSell,
}: SidebarSetupConstantMultipleProps) {
  const gasEstimation = useGasEstimationContext()

  const flow = getAutomationFormFlow({ isFirstSetup, isRemoveForm, feature })
  const sidebarTitle = getAutomationFormTitle({
    flow,
    stage,
    feature,
  })
  const dropdown = getAutoFeaturesSidebarDropdown({
    type: 'Optimization',
    forcePanel: AutomationFeatures.CONSTANT_MULTIPLE,
    disabled: isDropdownDisabled({ stage }),
    isAutoBuyEnabled: autoBuyTriggerData.isTriggerEnabled,
    isAutoConstantMultipleEnabled: constantMultipleTriggerData.isTriggerEnabled,
    isAutoTakeProfitEnabled: autoTakeProfitTriggerData.isTriggerEnabled,
  })
  const primaryButtonLabel = getAutomationPrimaryButtonLabel({
    flow,
    stage,
    feature,
  })
  const textButtonLabel = getAutomationTextButtonLabel({ isAddForm })
  const sidebarStatus = getAutomationStatusTitle({
    stage,
    txHash: constantMultipleState.txDetails?.txHash,
    flow,
    etherscan: context.etherscan.url,
    feature,
  })

  const errors = errorsConstantMultipleValidation({
    constantMultipleState,
    isRemoveForm,
    debtDeltaWhenSellAtCurrentCollRatio,
    debtDeltaAfterSell,
    debtFloor: ilkData.debtFloor,
    debt: vault.debt,
    nextBuyPrice,
    nextSellPrice,
  })
  const warnings = warningsConstantMultipleValidation({
    vault,
    debtFloor: ilkData.debtFloor,
    gasEstimationUsd: gasEstimation?.usdValue,
    ethBalance: balanceInfo.ethBalance,
    ethPrice: ethMarketPrice,
    sliderMin: constantMultipleState.minTargetRatio,
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    isAutoBuyEnabled: autoBuyTriggerData.isTriggerEnabled,
    isAutoSellEnabled: autoSellTriggerData.isTriggerEnabled,
    isAutoTakeProfitEnabled: autoTakeProfitTriggerData.isTriggerEnabled,
    constantMultipleState,
    debtDeltaWhenSellAtCurrentCollRatio,
    constantMultipleBuyExecutionPrice: nextBuyPrice,
    autoTakeProfitExecutionPrice: autoTakeProfitTriggerData.executionPrice,
  })
  const cancelConstantMultipleErrors = extractCancelAutomationErrors(errors)
  const cancelConstantMultipleWarnings = extractCancelAutomationWarnings(warnings)
  const validationErrors = isAddForm ? errors : cancelConstantMultipleErrors

  if (isConstantMultipleActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: sidebarTitle,
      dropdown,
      content: (
        <Grid gap={3}>
          {(stage === 'editing' || stage === 'txFailure') && (
            <>
              {isAddForm && (
                <SidebarConstantMultipleEditingStage
                  vault={vault}
                  ilkData={ilkData}
                  isEditing={isEditing}
                  autoBuyTriggerData={autoBuyTriggerData}
                  errors={errors}
                  warnings={warnings}
                  token={vault.token}
                  constantMultipleState={constantMultipleState}
                  autoSellTriggerData={autoSellTriggerData}
                  constantMultipleTriggerData={constantMultipleTriggerData}
                  nextBuyPrice={nextBuyPrice}
                  nextSellPrice={nextSellPrice}
                  collateralToBePurchased={collateralToBePurchased}
                  collateralToBeSold={collateralToBeSold}
                  estimatedGasCostOnTrigger={estimatedGasCostOnTrigger}
                  estimatedBuyFee={estimatedBuyFee}
                  estimatedSellFee={estimatedSellFee}
                  stopLossTriggerData={stopLossTriggerData}
                />
              )}
              {isRemoveForm && (
                <SidebarConstantMultipleRemovalEditingStage
                  vault={vault}
                  ilkData={ilkData}
                  errors={cancelConstantMultipleErrors}
                  warnings={cancelConstantMultipleWarnings}
                  constantMultipleTriggerData={constantMultipleTriggerData}
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
      ...(stage !== 'txInProgress' &&
        stage !== 'txSuccess' && {
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