import { IlkDataChange } from 'apps/main/blockchain/ilks'
import { BalanceInfoChange } from 'apps/main/features/shared/balanceInfo'
import { PriceInfoChange } from 'apps/main/features/shared/priceInfo'
import { SlippageChange } from 'apps/main/features/userSettings/userSettings'

import { OpenMultiplyVaultChange, OpenMultiplyVaultState } from './openMultiplyVault'

export type OpenVaultEnvironmentChange =
  | PriceInfoChange
  | BalanceInfoChange
  | IlkDataChange
  | SlippageChange

export function applyOpenVaultEnvironment(
  state: OpenMultiplyVaultState,
  change: OpenMultiplyVaultChange,
): OpenMultiplyVaultState {
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

  if (change.kind === 'slippage') {
    return {
      ...state,
      slippage: change.slippage,
    }
  }

  return state
}
