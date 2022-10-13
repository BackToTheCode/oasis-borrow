import { BalanceInfo } from 'apps/main/features/shared/balanceInfo'
import { zero } from 'apps/main/helpers/zero'

import { OpenVaultState } from './openVault'
import { OpenVaultCalculations } from './openVaultCalculations'

export type OpenVaultSummary = Pick<OpenVaultCalculations, 'afterCollateralBalance'> &
  Pick<BalanceInfo, 'collateralBalance'>

export const defaultOpenVaultSummary: OpenVaultSummary = {
  collateralBalance: zero,
  afterCollateralBalance: zero,
}

export function applyOpenVaultSummary(state: OpenVaultState) {
  const {
    isOpenStage,
    balanceInfo: { collateralBalance },
    afterCollateralBalance,
  } = state

  if (isOpenStage) return state

  return {
    ...state,
    summary: {
      collateralBalance,
      afterCollateralBalance,
    },
  }
}
