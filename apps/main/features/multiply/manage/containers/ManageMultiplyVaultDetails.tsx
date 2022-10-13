import { useAutomationContext } from 'apps/main/components/AutomationContextProvider'
import { DetailsSection } from 'apps/main/components/DetailsSection'
import {
  DetailsSectionContentCardWrapper,
  getChangeVariant,
} from 'apps/main/components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'apps/main/components/DetailsSectionFooterItem'
import { ContentCardBuyingPower } from 'apps/main/components/vault/detailsSection/ContentCardBuyingPower'
import { ContentCardDynamicStopPriceWithColRatio } from 'apps/main/components/vault/detailsSection/ContentCardDynamicStopPriceWithColRatio'
import { ContentCardLiquidationPrice } from 'apps/main/components/vault/detailsSection/ContentCardLiquidationPrice'
import { ContentCardNetValue } from 'apps/main/components/vault/detailsSection/ContentCardNetValue'
import { ContentFooterItemsMultiply } from 'apps/main/components/vault/detailsSection/ContentFooterItemsMultiply'
import { getCollRatioColor } from 'apps/main/components/vault/VaultDetails'
import { GetProtectionBannerControl } from 'apps/main/features/automation/protection/stopLoss/controls/GetProtectionBannerControl'
import { StopLossTriggeredBannerControl } from 'apps/main/features/automation/protection/stopLoss/controls/StopLossTriggeredBannerControl'
import { useFeatureToggle } from 'apps/main/helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { ManageMultiplyVaultState } from '../pipes/manageMultiplyVault'

export function ManageMultiplyVaultDetails(props: ManageMultiplyVaultState) {
  const {
    vault: { token, liquidationPrice, debt, lockedCollateral, lockedCollateralUSD, ilk },
    ilkData: { liquidationRatio },
    afterDebt,
    afterLockedCollateral,
    multiply,
    afterMultiply,
    liquidationPriceCurrentPriceDifference,
    afterLiquidationPrice,
    afterCollateralizationRatio,
    inputAmountsEmpty,
    stage,
    netValueUSD,
    afterNetValueUSD,
    buyingPower,
    buyingPowerUSD,
    afterBuyingPowerUSD,
    currentPnL,
    marketPrice,
    totalGasSpentUSD,
    priceInfo,
    stopLossTriggered,
  } = props
  const { t } = useTranslation()
  const { stopLossTriggerData } = useAutomationContext()

  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const showAfterPill = !inputAmountsEmpty && stage !== 'manageSuccess'
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')
  const stopLossWriteEnabled = useFeatureToggle('StopLossWrite')
  const changeVariant = showAfterPill ? getChangeVariant(afterCollRatioColor) : undefined
  const oraclePrice = priceInfo.currentCollateralPrice

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
            <ContentCardBuyingPower
              token={token}
              buyingPower={buyingPower}
              buyingPowerUSD={buyingPowerUSD}
              afterBuyingPowerUSD={afterBuyingPowerUSD}
              changeVariant={changeVariant}
            />
            <ContentCardNetValue
              token={token}
              oraclePrice={oraclePrice}
              marketPrice={marketPrice}
              netValueUSD={netValueUSD}
              afterNetValueUSD={afterNetValueUSD}
              totalGasSpentUSD={totalGasSpentUSD}
              currentPnL={currentPnL}
              lockedCollateral={lockedCollateral}
              lockedCollateralUSD={lockedCollateralUSD}
              debt={debt}
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
            <ContentFooterItemsMultiply
              token={token}
              debt={debt}
              lockedCollateral={lockedCollateral}
              multiply={multiply}
              afterDebt={afterDebt}
              afterLockedCollateral={afterLockedCollateral}
              afterMultiply={afterMultiply}
              changeVariant={changeVariant}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />

      {stopLossReadEnabled && stopLossWriteEnabled && (
        <GetProtectionBannerControl token={token} ilk={ilk} debt={debt} />
      )}
    </Grid>
  )
}
