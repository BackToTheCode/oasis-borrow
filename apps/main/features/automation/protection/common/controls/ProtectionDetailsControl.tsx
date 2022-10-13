import { IlkData } from 'apps/main/blockchain/ilks'
import { Vault } from 'apps/main/blockchain/vaults'
import { useAutomationContext } from 'apps/main/components/AutomationContextProvider'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'apps/main/features/automation/common/state/automationFeatureChange'
import { AutoSellDetailsControl } from 'apps/main/features/automation/protection/autoSell/controls/AutoSellDetailsControl'
import { getActiveProtectionFeature } from 'apps/main/features/automation/protection/common/helpers'
import { StopLossDetailsControl } from 'apps/main/features/automation/protection/stopLoss/controls/StopLossDetailsControl'
import { useUIChanges } from 'apps/main/helpers/uiChangesHook'
import { useFeatureToggle } from 'apps/main/helpers/useFeatureToggle'
import React from 'react'

interface ProtectionDetailsControlProps {
  ilkData: IlkData
  vault: Vault
}

export function ProtectionDetailsControl({ vault, ilkData }: ProtectionDetailsControlProps) {
  const {
    stopLossTriggerData,
    autoSellTriggerData,
    constantMultipleTriggerData,
  } = useAutomationContext()

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const autoBSEnabled = useFeatureToggle('BasicBS')

  const { isStopLossActive, isAutoSellActive } = getActiveProtectionFeature({
    currentProtectionFeature: activeAutomationFeature?.currentProtectionFeature,
    isAutoSellOn: autoSellTriggerData.isTriggerEnabled,
    isStopLossOn: stopLossTriggerData.isStopLossEnabled,
    section: 'details',
  })

  return (
    <>
      <StopLossDetailsControl
        vault={vault}
        stopLossTriggerData={stopLossTriggerData}
        ilkData={ilkData}
        isStopLossActive={isStopLossActive}
      />
      {autoBSEnabled && (
        <AutoSellDetailsControl
          vault={vault}
          autoSellTriggerData={autoSellTriggerData}
          isAutoSellActive={isAutoSellActive}
          isconstantMultipleEnabled={constantMultipleTriggerData.isTriggerEnabled}
        />
      )}
    </>
  )
}
