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
import { AutoSellFormControl } from 'apps/main/features/automation/protection/autoSell/controls/AutoSellFormControl'
import { getActiveProtectionFeature } from 'apps/main/features/automation/protection/common/helpers'
import { StopLossFormControl } from 'apps/main/features/automation/protection/stopLoss/controls/StopLossFormControl'
import { BalanceInfo } from 'apps/main/features/shared/balanceInfo'
import { PriceInfo } from 'apps/main/features/shared/priceInfo'
import { useUIChanges } from 'apps/main/helpers/uiChangesHook'
import React, { useEffect } from 'react'

interface ProtectionFormControlProps {
  ilkData: IlkData
  priceInfo: PriceInfo
  vault: Vault
  balanceInfo: BalanceInfo
  txHelpers?: TxHelpers
  context: Context
  ethMarketPrice: BigNumber
}

export function ProtectionFormControl({
  ilkData,
  priceInfo,
  vault,
  balanceInfo,
  context,
  txHelpers,
  ethMarketPrice,
}: ProtectionFormControlProps) {
  const {
    stopLossTriggerData,
    autoSellTriggerData,
    autoBuyTriggerData,
    constantMultipleTriggerData,
    automationTriggersData,
  } = useAutomationContext()

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const { uiChanges } = useAppContext()

  const shouldRemoveAllowance = getShouldRemoveAllowance(automationTriggersData)

  const { isStopLossActive, isAutoSellActive } = getActiveProtectionFeature({
    currentProtectionFeature: activeAutomationFeature?.currentProtectionFeature,
    isAutoSellOn: autoSellTriggerData.isTriggerEnabled,
    isStopLossOn: stopLossTriggerData.isStopLossEnabled,
    section: 'form',
  })

  useEffect(() => {
    if (isAutoSellActive) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Protection',
        currentProtectionFeature: AutomationFeatures.AUTO_SELL,
      })
    }
    if (isStopLossActive) {
      uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
        type: 'Protection',
        currentProtectionFeature: AutomationFeatures.STOP_LOSS,
      })
    }
  }, [autoSellTriggerData.isTriggerEnabled, stopLossTriggerData.isStopLossEnabled])

  return (
    <>
      <StopLossFormControl
        ilkData={ilkData}
        stopLossTriggerData={stopLossTriggerData}
        autoSellTriggerData={autoSellTriggerData}
        autoBuyTriggerData={autoBuyTriggerData}
        constantMultipleTriggerData={constantMultipleTriggerData}
        priceInfo={priceInfo}
        vault={vault}
        balanceInfo={balanceInfo}
        isStopLossActive={isStopLossActive}
        context={context}
        txHelpers={txHelpers}
        ethMarketPrice={ethMarketPrice}
        shouldRemoveAllowance={shouldRemoveAllowance}
      />
      <AutoSellFormControl
        vault={vault}
        ilkData={ilkData}
        balanceInfo={balanceInfo}
        autoSellTriggerData={autoSellTriggerData}
        autoBuyTriggerData={autoBuyTriggerData}
        stopLossTriggerData={stopLossTriggerData}
        constantMultipleTriggerData={constantMultipleTriggerData}
        isAutoSellActive={isAutoSellActive}
        context={context}
        txHelpers={txHelpers}
        ethMarketPrice={ethMarketPrice}
        shouldRemoveAllowance={shouldRemoveAllowance}
      />
    </>
  )
}
