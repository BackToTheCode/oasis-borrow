import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { IlkData } from 'apps/main/blockchain/ilks'
import { Context } from 'apps/main/blockchain/network'
import { Vault } from 'apps/main/blockchain/vaults'
import { TxHelpers } from 'apps/main/components/AppContext'
import { AddAndRemoveTriggerControl } from 'apps/main/features/automation/common/controls/AddAndRemoveTriggerControl'
import {
  AUTO_BUY_FORM_CHANGE,
  AutoBSFormChange,
} from 'apps/main/features/automation/common/state/autoBSFormChange'
import { getAutoBSStatus } from 'apps/main/features/automation/common/state/autoBSStatus'
import { AutoBSTriggerData } from 'apps/main/features/automation/common/state/autoBSTriggerData'
import { getAutoBSTxHandlers } from 'apps/main/features/automation/common/state/autoBSTxHandlers'
import { getAutomationFeatureStatus } from 'apps/main/features/automation/common/state/automationFeatureStatus'
import { AutomationFeatures } from 'apps/main/features/automation/common/types'
import { SidebarSetupAutoBuy } from 'apps/main/features/automation/optimization/autoBuy/sidebars/SidebarSetupAutoBuy'
import { AutoTakeProfitTriggerData } from 'apps/main/features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { ConstantMultipleTriggerData } from 'apps/main/features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { StopLossTriggerData } from 'apps/main/features/automation/protection/stopLoss/state/stopLossTriggerData'
import { VaultType } from 'apps/main/features/generalManageVault/vaultType'
import { BalanceInfo } from 'apps/main/features/shared/balanceInfo'
import { useUIChanges } from 'apps/main/helpers/uiChangesHook'
import React from 'react'

interface AutoBuyFormControlProps {
  autoBuyTriggerData: AutoBSTriggerData
  autoSellTriggerData: AutoBSTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  balanceInfo: BalanceInfo
  context: Context
  ethMarketPrice: BigNumber
  ilkData: IlkData
  isAutoBuyActive: boolean
  isAutoBuyOn: boolean
  shouldRemoveAllowance: boolean
  stopLossTriggerData: StopLossTriggerData
  txHelpers?: TxHelpers
  vault: Vault
  vaultType: VaultType
}

export function AutoBuyFormControl({
  autoBuyTriggerData,
  autoSellTriggerData,
  constantMultipleTriggerData,
  autoTakeProfitTriggerData,
  balanceInfo,
  context,
  ethMarketPrice,
  ilkData,
  isAutoBuyActive,
  isAutoBuyOn,
  shouldRemoveAllowance,
  stopLossTriggerData,
  txHelpers,
  vault,
  vaultType,
}: AutoBuyFormControlProps) {
  const [autoBuyState] = useUIChanges<AutoBSFormChange>(AUTO_BUY_FORM_CHANGE)

  const feature = AutomationFeatures.AUTO_BUY
  const publishType = AUTO_BUY_FORM_CHANGE
  const {
    isAddForm,
    isFirstSetup,
    isOwner,
    isProgressStage,
    isRemoveForm,
    stage,
  } = getAutomationFeatureStatus({
    context,
    currentForm: autoBuyState.currentForm,
    feature: AutomationFeatures.AUTO_BUY,
    triggersId: [autoBuyTriggerData.triggerId],
    txStatus: autoBuyState.txDetails?.txStatus,
    vaultController: vault.controller,
  })
  const {
    collateralDelta,
    debtDelta,
    isDisabled,
    isEditing,
    resetData,
    executionPrice,
  } = getAutoBSStatus({
    autoBSState: autoBuyState,
    autoBSTriggerData: autoBuyTriggerData,
    isAddForm,
    isOwner,
    isProgressStage,
    isRemoveForm,
    publishType,
    stage,
    vault,
  })
  const { addTxData, textButtonHandlerExtension } = getAutoBSTxHandlers({
    autoBSState: autoBuyState,
    isAddForm,
    publishType,
    triggerType: TriggerType.BasicBuy,
    vault,
  })

  return (
    <AddAndRemoveTriggerControl
      addTxData={addTxData}
      ethMarketPrice={ethMarketPrice}
      isActiveFlag={isAutoBuyActive}
      isAddForm={isAddForm}
      isEditing={isEditing}
      isRemoveForm={isRemoveForm}
      proxyAddress={vault.owner}
      publishType={publishType}
      resetData={resetData}
      shouldRemoveAllowance={shouldRemoveAllowance}
      stage={stage}
      textButtonHandlerExtension={textButtonHandlerExtension}
      triggersId={[autoBuyTriggerData.triggerId.toNumber()]}
      txHelpers={txHelpers}
    >
      {(textButtonHandler, txHandler) => (
        <SidebarSetupAutoBuy
          autoBuyState={autoBuyState}
          autoBuyTriggerData={autoBuyTriggerData}
          autoSellTriggerData={autoSellTriggerData}
          constantMultipleTriggerData={constantMultipleTriggerData}
          autoTakeProfitTriggerData={autoTakeProfitTriggerData}
          balanceInfo={balanceInfo}
          collateralDelta={collateralDelta}
          context={context}
          debtDelta={debtDelta}
          ethMarketPrice={ethMarketPrice}
          feature={feature}
          ilkData={ilkData}
          isAddForm={isAddForm}
          isAutoBuyActive={isAutoBuyActive}
          isAutoBuyOn={isAutoBuyOn}
          isDisabled={isDisabled}
          isEditing={isEditing}
          isFirstSetup={isFirstSetup}
          isRemoveForm={isRemoveForm}
          stage={stage}
          stopLossTriggerData={stopLossTriggerData}
          textButtonHandler={textButtonHandler}
          txHandler={txHandler}
          vault={vault}
          vaultType={vaultType}
          executionPrice={executionPrice}
        />
      )}
    </AddAndRemoveTriggerControl>
  )
}
