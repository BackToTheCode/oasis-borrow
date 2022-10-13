import { IlkDataChange } from 'apps/main/blockchain/ilks'
import { VaultChange } from 'apps/main/blockchain/vaults'
import { AutomationTriggersChange } from 'apps/main/features/automation/api/automationTriggersData'
import { BalanceInfoChange } from 'apps/main/features/shared/balanceInfo'
import { PriceInfoChange } from 'apps/main/features/shared/priceInfo'
import { VaultHistoryChange } from 'apps/main/features/vaultHistory/vaultHistory'

import { ManageStandardBorrowVaultState, ManageVaultChange } from '../manageVault'

export type ManageVaultEnvironmentChange =
  | PriceInfoChange
  | BalanceInfoChange
  | IlkDataChange
  | VaultChange
  | VaultHistoryChange
  | AutomationTriggersChange

export function applyManageVaultEnvironment<VaultState extends ManageStandardBorrowVaultState>(
  change: ManageVaultChange,
  state: VaultState,
): VaultState {
  if (change.kind === 'priceInfo') {
    return {
      ...state,
      priceInfo: change.priceInfo,
    }
  }

  if (change.kind === 'balanceInfo') {
    return {
      ...state,
      balanceInfo: change.balanceInfo,
    }
  }

  if (change.kind === 'ilkData') {
    return {
      ...state,
      ilkData: change.ilkData,
    }
  }

  if (change.kind === 'vault') {
    return {
      ...state,
      vault: change.vault,
    }
  }

  if (change.kind === 'vaultHistory') {
    return {
      ...state,
      vaultHistory: change.vaultHistory,
    }
  }

  if (change.kind === 'automationTriggersData') {
    return {
      ...state,
      stopLossData: change.stopLossData,
      autoSellData: change.autoSellData,
      autoBuyData: change.autoBuyData,
      constantMultipleData: change.constantMultipleData,
    }
  }

  return state
}
