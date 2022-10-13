import { getToken } from 'apps/main/blockchain/tokensMetadata'
import { useAutomationContext } from 'apps/main/components/AutomationContextProvider'
import { DetailsSection } from 'apps/main/components/DetailsSection'
import {
  DetailsSectionContentCardWrapper,
  getChangeVariant,
} from 'apps/main/components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'apps/main/components/DetailsSectionFooterItem'
import { ContentCardCollateralizationRatio } from 'apps/main/components/vault/detailsSection/ContentCardCollateralizationRatio'
import { ContentCardCollateralLocked } from 'apps/main/components/vault/detailsSection/ContentCardCollateralLocked'
import { ContentCardDynamicStopPriceWithColRatio } from 'apps/main/components/vault/detailsSection/ContentCardDynamicStopPriceWithColRatio'
import { ContentCardLiquidationPrice } from 'apps/main/components/vault/detailsSection/ContentCardLiquidationPrice'
import { ContentFooterItemsBorrow } from 'apps/main/components/vault/detailsSection/ContentFooterItemsBorrow'
import {
  AfterPillProps,
  getCollRatioColor,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'apps/main/components/vault/VaultDetails'
import { GetProtectionBannerControl } from 'apps/main/features/automation/protection/stopLoss/controls/GetProtectionBannerControl'
import { StopLossTriggeredBannerControl } from 'apps/main/features/automation/protection/stopLoss/controls/StopLossTriggeredBannerControl'
import { formatAmount } from 'apps/main/helpers/formatters/format'
import { useFeatureToggle } from 'apps/main/helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { BonusContainer } from '../../../bonus/BonusContainer'
import { ManageStandardBorrowVaultState } from '../pipes/manageVault'

export function ManageVaultDetailsSummary({
  vault: { debt, token, freeCollateral, daiYieldFromLockedCollateral },
  afterDebt,
  afterFreeCollateral,
  daiYieldFromTotalCollateral,
  afterPillColors,
  showAfterPill,
}: ManageStandardBorrowVaultState & AfterPillProps) {
  const { t } = useTranslation()
  const { symbol } = getToken(token)

  return (
    <VaultDetailsSummaryContainer>
      <VaultDetailsSummaryItem
        label={t('system.vault-dai-debt')}
        value={
          <>
            {formatAmount(debt, 'DAI')}
            {` DAI`}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatAmount(afterDebt, 'DAI')}
              {` DAI`}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />

      <VaultDetailsSummaryItem
        label={t('system.available-to-withdraw')}
        value={
          <>
            {formatAmount(freeCollateral, symbol)}
            {` ${symbol}`}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatAmount(afterFreeCollateral, symbol)}
              {` ${symbol}`}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />
      <VaultDetailsSummaryItem
        label={t('system.available-to-generate')}
        value={
          <>
            {formatAmount(daiYieldFromLockedCollateral, 'DAI')}
            {` DAI`}
          </>
        }
        valueAfter={
          showAfterPill && (
            <>
              {formatAmount(daiYieldFromTotalCollateral, 'DAI')}
              {` DAI`}
            </>
          )
        }
        afterPillColors={afterPillColors}
      />
    </VaultDetailsSummaryContainer>
  )
}

export function ManageVaultDetails(
  props: ManageStandardBorrowVaultState & { onBannerButtonClickHandler: () => void },
) {
  const {
    vault: {
      daiYieldFromLockedCollateral,
      debt,
      freeCollateral,
      token,
      liquidationPrice,
      lockedCollateral,
      lockedCollateralUSD,
      collateralizationRatio,
      ilk,
    },
    ilkData: { liquidationRatio },
    liquidationPriceCurrentPriceDifference,
    afterLiquidationPrice,
    afterCollateralizationRatio,
    afterLockedCollateralUSD,
    collateralizationRatioAtNextPrice,
    afterDebt,
    afterFreeCollateral,
    daiYieldFromTotalCollateral,
    inputAmountsEmpty,
    stage,
    stopLossTriggered,
  } = props
  const { t } = useTranslation()
  const { stopLossTriggerData } = useAutomationContext()

  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const showAfterPill = !inputAmountsEmpty && stage !== 'manageSuccess'
  const changeVariant = showAfterPill ? getChangeVariant(afterCollRatioColor) : undefined
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')
  const stopLossWriteEnabled = useFeatureToggle('StopLossWrite')

  return (
    <Grid>
      {stopLossReadEnabled && <>{stopLossTriggered && <StopLossTriggeredBannerControl />}</>}
      <DetailsSection
        title={t('system.overview')}
        content={
          <DetailsSectionContentCardWrapper>
            <ContentCardLiquidationPrice
              liquidationPrice={liquidationPrice}
              liquidationRatio={liquidationRatio}
              liquidationPriceCurrentPriceDifference={liquidationPriceCurrentPriceDifference}
              afterLiquidationPrice={afterLiquidationPrice}
              changeVariant={changeVariant}
            />
            <ContentCardCollateralizationRatio
              collateralizationRatio={collateralizationRatio}
              collateralizationRatioAtNextPrice={collateralizationRatioAtNextPrice}
              afterCollateralizationRatio={afterCollateralizationRatio}
              changeVariant={changeVariant}
            />
            <ContentCardCollateralLocked
              token={token}
              lockedCollateralUSD={lockedCollateralUSD}
              lockedCollateral={lockedCollateral}
              afterLockedCollateralUSD={afterLockedCollateralUSD}
              changeVariant={changeVariant}
            />
            {stopLossTriggerData.isStopLossEnabled && (
              <ContentCardDynamicStopPriceWithColRatio
                slData={stopLossTriggerData}
                liquidationPrice={liquidationPrice}
                afterLiquidationPrice={afterLiquidationPrice}
                liquidationRatio={liquidationRatio}
                changeVariant={changeVariant}
              />
            )}
          </DetailsSectionContentCardWrapper>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <ContentFooterItemsBorrow
              token={token}
              debt={debt}
              freeCollateral={freeCollateral}
              afterDebt={afterDebt}
              afterFreeCollateral={afterFreeCollateral}
              daiYieldFromLockedCollateral={daiYieldFromLockedCollateral}
              daiYieldFromTotalCollateral={daiYieldFromTotalCollateral}
              changeVariant={changeVariant}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />

      {stopLossReadEnabled && stopLossWriteEnabled && (
        <GetProtectionBannerControl token={token} ilk={ilk} debt={debt} />
      )}
      <BonusContainer cdpId={props.vault.id} />
    </Grid>
  )
}
