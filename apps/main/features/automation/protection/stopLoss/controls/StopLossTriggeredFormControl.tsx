import { BigNumber } from 'bignumber.js'
import { amountFromWei } from 'apps/main/blockchain/utils'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import { VaultViewMode } from 'apps/main/components/vault/GeneralManageTabBar'
import { StopLossTriggeredFormLayout } from 'apps/main/features/automation/protection/stopLoss/controls/StopLossTriggeredFormLayout'
import { TAB_CHANGE_SUBJECT } from 'apps/main/features/generalManageVault/TabChange'
import { calculatePriceImpact } from 'apps/main/features/shared/priceImpact'
import {
  CloseVaultExitCollateralMultipleEvent,
  CloseVaultExitDaiMultipleEvent,
} from 'apps/main/features/vaultHistory/vaultHistoryEvents'
import React from 'react'

interface StopLossTriggeredFormControlProps {
  closeEvent: CloseVaultExitDaiMultipleEvent | CloseVaultExitCollateralMultipleEvent
  onClick: () => void
}

export function StopLossTriggeredFormControl({
  closeEvent,
  onClick,
}: StopLossTriggeredFormControlProps) {
  const { uiChanges } = useAppContext()

  const handleClick = () => {
    uiChanges.publish(TAB_CHANGE_SUBJECT, {
      type: 'change-tab',
      currentMode: VaultViewMode.Overview,
    })
    onClick()
  }

  const offerPrice = closeEvent.oraclePrice.isZero()
    ? closeEvent.marketPrice
    : closeEvent.oraclePrice

  const outstandingDebt = closeEvent.beforeDebt
  const isToCollateral = closeEvent.kind === 'CLOSE_VAULT_TO_COLLATERAL'
  const withdrawAmount = isToCollateral ? closeEvent.exitCollateral : closeEvent.exitDai
  const tokenPrice = closeEvent.marketPrice
  const priceImpact = calculatePriceImpact(closeEvent.marketPrice, offerPrice)
  const totalFee = BigNumber.sum(
    closeEvent.totalFee,
    amountFromWei(closeEvent.gasFee, 'ETH').times(closeEvent.ethPrice),
  )

  const token = closeEvent.token
  const date = closeEvent.timestamp
  const tokensSold = closeEvent.sold
  const collRatio = closeEvent.beforeCollateralizationRatio

  return (
    <StopLossTriggeredFormLayout
      token={token}
      onClick={handleClick}
      paybackAmount={outstandingDebt}
      withdrawAmount={withdrawAmount}
      tokensSold={tokensSold}
      tokenPrice={tokenPrice}
      priceImpact={priceImpact}
      date={date}
      totalFee={totalFee}
      collRatio={collRatio}
      isToCollateral={isToCollateral}
    />
  )
}
