import BigNumber from 'bignumber.js'
import { Vault } from 'apps/main/blockchain/vaults'
import { useAutomationContext } from 'apps/main/components/AutomationContextProvider'
import { AutoBuyDetailsControl } from 'apps/main/features/automation/optimization/autoBuy/controls/AutoBuyDetailsControl'
import { AutoTakeProfitDetailsControl } from 'apps/main/features/automation/optimization/autoTakeProfit/controls/AutoTakeProfitDetailsControl'
import { ConstantMultipleDetailsControl } from 'apps/main/features/automation/optimization/constantMultiple/controls/ConstantMultipleDetailsControl'
import { VaultType } from 'apps/main/features/generalManageVault/vaultType'
import { VaultHistoryEvent } from 'apps/main/features/vaultHistory/vaultHistory'
import { useFeatureToggle } from 'apps/main/helpers/useFeatureToggle'
import React from 'react'

interface OptimizationDetailsControlProps {
  vault: Vault
  vaultType: VaultType
  vaultHistory: VaultHistoryEvent[]
  ethMarketPrice: BigNumber
  tokenMarketPrice: BigNumber
}

export function OptimizationDetailsControl({
  vault,
  vaultType,
  vaultHistory,
  ethMarketPrice,
  tokenMarketPrice,
}: OptimizationDetailsControlProps) {
  const {
    autoBuyTriggerData,
    constantMultipleTriggerData,
    autoTakeProfitTriggerData,
  } = useAutomationContext()
  const constantMultipleEnabled = useFeatureToggle('ConstantMultiple')
  const autoTakeProfitEnabled = useFeatureToggle('AutoTakeProfit')

  return (
    <>
      <AutoBuyDetailsControl
        vault={vault}
        autoBuyTriggerData={autoBuyTriggerData}
        isconstantMultipleEnabled={constantMultipleTriggerData.isTriggerEnabled}
      />
      {constantMultipleEnabled && (
        <ConstantMultipleDetailsControl
          vault={vault}
          vaultType={vaultType}
          vaultHistory={vaultHistory}
          tokenMarketPrice={tokenMarketPrice}
          constantMultipleTriggerData={constantMultipleTriggerData}
        />
      )}
      {autoTakeProfitEnabled && (
        <AutoTakeProfitDetailsControl
          ethMarketPrice={ethMarketPrice}
          vault={vault}
          autoTakeProfitTriggerData={autoTakeProfitTriggerData}
        />
      )}
    </>
  )
}
