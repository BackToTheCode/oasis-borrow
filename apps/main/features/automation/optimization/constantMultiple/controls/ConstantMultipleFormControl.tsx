import BigNumber from 'bignumber.js'
import { IlkData } from 'apps/main/blockchain/ilks'
import { Context } from 'apps/main/blockchain/network'
import { Vault } from 'apps/main/blockchain/vaults'
import { TxHelpers } from 'apps/main/components/AppContext'
import { AddAndRemoveTriggerControl } from 'apps/main/features/automation/common/controls/AddAndRemoveTriggerControl'
import { AutoBSTriggerData } from 'apps/main/features/automation/common/state/autoBSTriggerData'
import { getAutomationFeatureStatus } from 'apps/main/features/automation/common/state/automationFeatureStatus'
import { AutomationFeatures } from 'apps/main/features/automation/common/types'
import { AutoTakeProfitTriggerData } from 'apps/main/features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { SidebarSetupConstantMultiple } from 'apps/main/features/automation/optimization/constantMultiple/sidebars/SidebarSetupConstantMultiple'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleFormChange,
} from 'apps/main/features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import { getConstantMultipleStatus } from 'apps/main/features/automation/optimization/constantMultiple/state/constantMultipleStatus'
import { ConstantMultipleTriggerData } from 'apps/main/features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { getConstantMultipleTxHandlers } from 'apps/main/features/automation/optimization/constantMultiple/state/constantMultipleTxHandlers'
import { StopLossTriggerData } from 'apps/main/features/automation/protection/stopLoss/state/stopLossTriggerData'
import { BalanceInfo } from 'apps/main/features/shared/balanceInfo'
import { useUIChanges } from 'apps/main/helpers/uiChangesHook'
import React from 'react'

interface ConstantMultipleFormControlProps {
  autoBuyTriggerData: AutoBSTriggerData
  autoSellTriggerData: AutoBSTriggerData
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  balanceInfo: BalanceInfo
  constantMultipleTriggerData: ConstantMultipleTriggerData
  context: Context
  ethMarketPrice: BigNumber
  ilkData: IlkData
  isConstantMultipleActive: boolean
  shouldRemoveAllowance: boolean
  stopLossTriggerData: StopLossTriggerData
  txHelpers?: TxHelpers
  vault: Vault
}

export function ConstantMultipleFormControl({
  autoBuyTriggerData,
  autoSellTriggerData,
  autoTakeProfitTriggerData,
  balanceInfo,
  constantMultipleTriggerData,
  context,
  ethMarketPrice,
  ilkData,
  isConstantMultipleActive,
  shouldRemoveAllowance,
  stopLossTriggerData,
  txHelpers,
  vault,
}: ConstantMultipleFormControlProps) {
  const [constantMultipleState] = useUIChanges<ConstantMultipleFormChange>(
    CONSTANT_MULTIPLE_FORM_CHANGE,
  )

  const feature = AutomationFeatures.CONSTANT_MULTIPLE
  const {
    isAddForm,
    isFirstSetup,
    isOwner,
    isProgressStage,
    isRemoveForm,
    stage,
  } = getAutomationFeatureStatus({
    context,
    currentForm: constantMultipleState.currentForm,
    feature,
    triggersId: constantMultipleTriggerData.triggersId,
    txStatus: constantMultipleState.txDetails?.txStatus,
    vaultController: vault.controller,
  })
  const {
    collateralToBePurchased,
    collateralToBeSold,
    debtDeltaAfterSell,
    debtDeltaWhenSellAtCurrentCollRatio,
    estimatedBuyFee,
    estimatedGasCostOnTrigger,
    estimatedSellFee,
    isDisabled,
    isEditing,
    nextBuyPrice,
    nextSellPrice,
    resetData,
  } = getConstantMultipleStatus({
    constantMultipleState,
    constantMultipleTriggerData,
    ethMarketPrice,
    isAddForm,
    isOwner,
    isProgressStage,
    isRemoveForm,
    stage,
    vault,
  })
  const { addTxData, textButtonHandlerExtension } = getConstantMultipleTxHandlers({
    autoBuyTriggerData,
    autoSellTriggerData,
    constantMultipleState,
    constantMultipleTriggerData,
    isAddForm,
    vault,
  })

  return (
    <AddAndRemoveTriggerControl
      addTxData={addTxData}
      ethMarketPrice={ethMarketPrice}
      isActiveFlag={isConstantMultipleActive}
      isAddForm={isAddForm}
      isEditing={isEditing}
      isRemoveForm={isRemoveForm}
      proxyAddress={vault.owner}
      publishType={CONSTANT_MULTIPLE_FORM_CHANGE}
      resetData={resetData}
      shouldRemoveAllowance={shouldRemoveAllowance}
      stage={stage}
      textButtonHandlerExtension={textButtonHandlerExtension}
      triggersId={constantMultipleTriggerData.triggersId.map((id) => id.toNumber())}
      txHelpers={txHelpers}
    >
      {(textButtonHandler, txHandler) => (
        <SidebarSetupConstantMultiple
          autoBuyTriggerData={autoBuyTriggerData}
          autoSellTriggerData={autoSellTriggerData}
          autoTakeProfitTriggerData={autoTakeProfitTriggerData}
          balanceInfo={balanceInfo}
          collateralToBePurchased={collateralToBePurchased}
          collateralToBeSold={collateralToBeSold}
          constantMultipleState={constantMultipleState}
          constantMultipleTriggerData={constantMultipleTriggerData}
          context={context}
          debtDeltaAfterSell={debtDeltaAfterSell}
          debtDeltaWhenSellAtCurrentCollRatio={debtDeltaWhenSellAtCurrentCollRatio}
          estimatedBuyFee={estimatedBuyFee}
          estimatedGasCostOnTrigger={estimatedGasCostOnTrigger}
          estimatedSellFee={estimatedSellFee}
          ethMarketPrice={ethMarketPrice}
          feature={feature}
          ilkData={ilkData}
          isAddForm={isAddForm}
          isConstantMultipleActive={isConstantMultipleActive}
          isDisabled={isDisabled}
          isEditing={isEditing}
          isFirstSetup={isFirstSetup}
          isRemoveForm={isRemoveForm}
          nextBuyPrice={nextBuyPrice}
          nextSellPrice={nextSellPrice}
          stage={stage}
          stopLossTriggerData={stopLossTriggerData}
          textButtonHandler={textButtonHandler}
          txHandler={txHandler}
          vault={vault}
        />
      )}
    </AddAndRemoveTriggerControl>
  )
}
