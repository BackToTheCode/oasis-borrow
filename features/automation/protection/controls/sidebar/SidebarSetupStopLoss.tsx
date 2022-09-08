import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { getAutoFeaturesSidebarDropdown } from 'features/automation/common/getAutoFeaturesSidebarDropdown'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/common/constantMultipleTriggerData'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import {
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
  StopLossResetData,
} from 'features/automation/protection/common/UITypes/StopLossFormChange'
import { TAB_CHANGE_SUBJECT } from 'features/automation/protection/common/UITypes/TabChange'
import {
  errorsStopLossValidation,
  warningsStopLossValidation,
} from 'features/automation/protection/common/validation'
import { SidebarCancelStopLossEditingStage } from 'features/automation/protection/controls/sidebar/SidebarCancelStopLossEditingStage'
import { StopLossCompleteInformation } from 'features/automation/protection/controls/StopLossCompleteInformation'
import { SidebarAutomationFeatureCreationStage } from 'features/automation/sidebars/SidebarAutomationFeatureCreationStage'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { extractCancelBSErrors, extractCancelBSWarnings } from 'helpers/messageMappers'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

import { SidebarAdjustStopLossEditingStage } from './SidebarAdjustStopLossEditingStage'

interface SidebarSetupStopLossProps {
  vault: Vault
  ilkData: IlkData
  balanceInfo: BalanceInfo
  autoSellTriggerData: BasicBSTriggerData
  autoBuyTriggerData: BasicBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  isStopLossActive: boolean
  context: Context
  ethMarketPrice: BigNumber
  stopLossState: StopLossFormChange
  txHandler: () => void
  textButtonHandler: () => void
  stage: SidebarVaultStages
  isAddForm: boolean
  isRemoveForm: boolean
  isEditing: boolean
  isDisabled: boolean
  isFirstSetup: boolean
  closePickerConfig: PickCloseStateProps
  sliderConfig: SliderValuePickerProps
  executionPrice: BigNumber
  resetData: StopLossResetData
}

export function SidebarSetupStopLoss({
  vault,
  ilkData,
  balanceInfo,
  context,
  ethMarketPrice,
  executionPrice,

  autoSellTriggerData,
  autoBuyTriggerData,
  stopLossTriggerData,
  constantMultipleTriggerData,

  stopLossState,
  txHandler,
  textButtonHandler,
  stage,
  resetData,

  isAddForm,
  isRemoveForm,
  isEditing,
  isDisabled,
  isFirstSetup,

  isStopLossActive,

  closePickerConfig,
  sliderConfig,
}: SidebarSetupStopLossProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const stopLossWriteEnabled = useFeatureToggle('StopLossWrite')
  const gasEstimationContext = useGasEstimationContext()

  const flow = isRemoveForm ? 'cancelSl' : isFirstSetup ? 'addSl' : 'adjustSl'
  const basicBSEnabled = useFeatureToggle('BasicBS')

  const errors = errorsStopLossValidation({
    txError: stopLossState.txDetails?.txError,
    debt: vault.debt,
    stopLossLevel: stopLossState.selectedSLValue,
    autoBuyTriggerData,
  })
  const warnings = warningsStopLossValidation({
    token: vault.token,
    gasEstimationUsd: gasEstimationContext?.usdValue,
    ethBalance: balanceInfo.ethBalance,
    ethPrice: ethMarketPrice,
    sliderMax: sliderConfig.maxBoundry,
    triggerRatio: stopLossState.selectedSLValue,
    isAutoSellEnabled: autoSellTriggerData.isTriggerEnabled,
    isConstantMultipleEnabled: constantMultipleTriggerData.isTriggerEnabled,
  })

  const dropdown = getAutoFeaturesSidebarDropdown({
    type: 'Protection',
    forcePanel: 'stopLoss',
    disabled: isDropdownDisabled({ stage }),
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    isAutoSellEnabled: autoSellTriggerData.isTriggerEnabled,
  })

  const cancelStopLossWarnings = extractCancelBSWarnings(warnings)
  const cancelStopLossErrors = extractCancelBSErrors(errors)

  const sidebarTitle = getSidebarTitle({
    flow,
    stage,
    token: vault.token,
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
  })
  const primaryButtonLabel = getPrimaryButtonLabel({ flow, stage, token: vault.token })
  const sidebarStatus = getSidebarStatus({
    flow,
    txHash: stopLossState.txDetails?.txHash,
    etherscan: context.etherscan.url,
    stage,
  })

  if (isStopLossActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: sidebarTitle,
      ...(basicBSEnabled && { dropdown }),
      content: (
        <Grid gap={3}>
          {stopLossWriteEnabled ? (
            <>
              {(stage === 'stopLossEditing' || stage === 'txFailure') && (
                <>
                  {isAddForm && (
                    <SidebarAdjustStopLossEditingStage
                      vault={vault}
                      ilkData={ilkData}
                      ethMarketPrice={ethMarketPrice}
                      executionPrice={executionPrice}
                      errors={errors}
                      warnings={warnings}
                      stopLossTriggerData={stopLossTriggerData}
                      stopLossState={stopLossState}
                      isEditing={isEditing}
                      closePickerConfig={closePickerConfig}
                      sliderConfig={sliderConfig}
                    />
                  )}
                  {isRemoveForm && (
                    <SidebarCancelStopLossEditingStage
                      vault={vault}
                      ilkData={ilkData}
                      errors={cancelStopLossErrors}
                      warnings={cancelStopLossWarnings}
                      stopLossState={stopLossState}
                    />
                  )}
                </>
              )}
            </>
          ) : (
            <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
              {t('protection.adding-new-triggers-disabled-description')}
            </Text>
          )}
          {(stage === 'txSuccess' || stage === 'txInProgress') && (
            <>
              {(stage === 'txSuccess' || stage === 'txInProgress') && (
                <SidebarAutomationFeatureCreationStage
                  featureName="Stop-Loss"
                  stage={stage}
                  isAddForm={isAddForm}
                  isRemoveForm={isRemoveForm}
                  customContent={
                    <StopLossCompleteInformation
                      afterStopLossRatio={stopLossState.selectedSLValue}
                      vault={vault}
                      ilkData={ilkData}
                      executionPrice={executionPrice}
                      isCollateralActive={stopLossState.collateralActive}
                      txCost={stopLossState.txDetails?.txCost!}
                    />
                  }
                />
              )}
            </>
          )}
        </Grid>
      ),
      primaryButton: {
        label: primaryButtonLabel,
        disabled: isDisabled || !!errors.length,
        isLoading: stage === 'txInProgress',
        action: () => {
          if (stage !== 'txSuccess') {
            txHandler()
          } else {
            uiChanges.publish(TAB_CHANGE_SUBJECT, {
              type: 'change-tab',
              currentMode: VaultViewMode.Overview,
            })
            uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
              type: 'reset',
              resetData,
            })
            uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
              type: 'current-form',
              currentForm: 'add',
            })
          }
        },
      },
      ...(stage !== 'txInProgress' && {
        textButton: {
          label: isAddForm ? t('system.remove-trigger') : t('system.add-trigger'),
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