import BigNumber from 'bignumber.js'
import { IlkData } from 'apps/main/blockchain/ilks'
import { Context } from 'apps/main/blockchain/network'
import { Vault } from 'apps/main/blockchain/vaults'
import { TxHelpers } from 'apps/main/components/AppContext'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import { useAutomationContext } from 'apps/main/components/AutomationContextProvider'
import { getShouldRemoveAllowance } from 'apps/main/features/automation/common/helpers'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'apps/main/features/automation/common/state/automationFeatureChange'
import { AutomationFeatures } from 'apps/main/features/automation/common/types'
import { AutoBuyFormControl } from 'apps/main/features/automation/optimization/autoBuy/controls/AutoBuyFormControl'
import { AutoTakeProfitFormControl } from 'apps/main/features/automation/optimization/autoTakeProfit/controls/AutoTakeProfitFormControl'
import { getActiveOptimizationFeature } from 'apps/main/features/automation/optimization/common/helpers'
import { ConstantMultipleFormControl } from 'apps/main/features/automation/optimization/constantMultiple/controls/ConstantMultipleFormControl'
import { VaultType } from 'apps/main/features/generalManageVault/vaultType'
import { BalanceInfo } from 'apps/main/features/shared/balanceInfo'
import { PriceInfo } from 'apps/main/features/shared/priceInfo'
import { useUIChanges } from 'apps/main/helpers/uiChangesHook'
import { useFeatureToggle } from 'apps/main/helpers/useFeatureToggle'
import React, { useEffect } from 'react'

interface OptimizationFormControlProps {
  balanceInfo: BalanceInfo
  context: Context
  ethMarketPrice: BigNumber
  tokenMarketPrice: BigNumber
  ilkData: IlkData
  txHelpers?: TxHelpers
  vault: Vault
  vaultType: VaultType
  priceInfo: PriceInfo
}

export function OptimizationFormControl({
  balanceInfo,
  context,
  ethMarketPrice,
  tokenMarketPrice,
  ilkData,
  txHelpers,
  vault,
  vaultType,
  priceInfo,
}: OptimizationFormControlProps) {
  const {
    autoBuyTriggerData,
    automationTriggersData,
    autoSellTriggerData,
    constantMultipleTriggerData,
    stopLossTriggerData,
    autoTakeProfitTriggerData,
  } = useAutomationContext()

  const { uiChanges } = useAppContext()
  const autoTakeProfitEnabled = useFeatureToggle('AutoTakeProfit')

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)

  const {
    isConstantMultipleActive,
    isAutoBuyActive,
    isAutoTakeProfitActive,
  } = getActiveOptimizationFeature({
    currentOptimizationFeature: activeAutomationFeature?.currentOptimizationFeature,
    isAutoBuyOn: autoBuyTriggerData.isTriggerEnabled,
    isConstantMultipleOn: constantMultipleTriggerData.isTriggerEnabled,
    isAutoTakeProfitOn: autoTakeProfitTriggerData.isTriggerEnabled,
    section: 'form',
  })

  const shouldRemoveAllowance = getShouldRemoveAllowance(automationTriggersData)

  useEffect(() => {
    if (autoTakeProfitTriggerData.isTriggerEnabled) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Optimization',
        currentOptimizationFeature: AutomationFeatures.AUTO_TAKE_PROFIT,
      })
    }
    if (constantMultipleTriggerData.isTriggerEnabled) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Optimization',
        currentOptimizationFeature: AutomationFeatures.CONSTANT_MULTIPLE,
      })
    }
    if (autoBuyTriggerData.isTriggerEnabled) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Optimization',
        currentOptimizationFeature: AutomationFeatures.AUTO_BUY,
      })
    }
  }, [])

  return (
    <>
      <AutoBuyFormControl
        autoBuyTriggerData={autoBuyTriggerData}
        autoSellTriggerData={autoSellTriggerData}
        constantMultipleTriggerData={constantMultipleTriggerData}
        autoTakeProfitTriggerData={autoTakeProfitTriggerData}
        balanceInfo={balanceInfo}
        context={context}
        ethMarketPrice={ethMarketPrice}
        ilkData={ilkData}
        isAutoBuyActive={isAutoBuyActive}
        isAutoBuyOn={autoBuyTriggerData.isTriggerEnabled}
        shouldRemoveAllowance={shouldRemoveAllowance}
        stopLossTriggerData={stopLossTriggerData}
        txHelpers={txHelpers}
        vault={vault}
        vaultType={vaultType}
      />
      <ConstantMultipleFormControl
        autoBuyTriggerData={autoBuyTriggerData}
        autoSellTriggerData={autoSellTriggerData}
        autoTakeProfitTriggerData={autoTakeProfitTriggerData}
        balanceInfo={balanceInfo}
        constantMultipleTriggerData={constantMultipleTriggerData}
        context={context}
        ethMarketPrice={ethMarketPrice}
        ilkData={ilkData}
        isConstantMultipleActive={isConstantMultipleActive}
        shouldRemoveAllowance={shouldRemoveAllowance}
        stopLossTriggerData={stopLossTriggerData}
        txHelpers={txHelpers}
        vault={vault}
      />
      {autoTakeProfitEnabled && (
        <AutoTakeProfitFormControl
          autoBuyTriggerData={autoBuyTriggerData}
          autoTakeProfitTriggerData={autoTakeProfitTriggerData}
          constantMultipleTriggerData={constantMultipleTriggerData}
          context={context}
          ethMarketPrice={ethMarketPrice}
          ilkData={ilkData}
          isAutoTakeProfitActive={isAutoTakeProfitActive}
          shouldRemoveAllowance={shouldRemoveAllowance}
          tokenMarketPrice={tokenMarketPrice}
          txHelpers={txHelpers}
          vault={vault}
          priceInfo={priceInfo}
          balanceInfo={balanceInfo}
        />
      )}
    </>
  )
}