import BigNumber from 'bignumber.js'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import { Banner, bannerGradientPresets } from 'apps/main/components/Banner'
import { DetailsSection } from 'apps/main/components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'apps/main/components/DetailsSectionContentCard'
import { AppLink } from 'apps/main/components/Links'
import { ContentCardOperatingCost } from 'apps/main/components/vault/detailsSection/ContentCardOperatingCost'
import { ContentCardTargetMultiple } from 'apps/main/components/vault/detailsSection/ContentCardTargetMultiple'
import { ContentCardTriggerColRatioToBuy } from 'apps/main/components/vault/detailsSection/ContentCardTriggerColRatioToBuy'
import { ContentCardTriggerColRatioToSell } from 'apps/main/components/vault/detailsSection/ContentCardTriggerColRatioToSell'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'apps/main/features/automation/common/state/automationFeatureChange'
import { AutomationFeatures } from 'apps/main/features/automation/common/types'
import { VaultType } from 'apps/main/features/generalManageVault/vaultType'
import { useUIChanges } from 'apps/main/helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export interface ConstantMultipleDetailsLayoutProps {
  token: string
  vaultType: VaultType
  isTriggerEnabled: boolean
  targetMultiple?: BigNumber
  targetColRatio?: BigNumber
  totalCost?: BigNumber
  PnLSinceEnabled?: BigNumber
  triggerColRatioToBuy?: BigNumber
  nextBuyPrice?: BigNumber
  triggerColRatioToSell?: BigNumber
  nextSellPrice?: BigNumber
  afterTargetMultiple?: number
  triggerColRatioToBuyToBuy?: BigNumber
  afterTriggerColRatioToSell?: BigNumber
}

export function ConstantMultipleDetailsLayout({
  token,
  vaultType,
  isTriggerEnabled,
  targetMultiple,
  targetColRatio,
  totalCost,
  PnLSinceEnabled,
  triggerColRatioToBuy,
  nextBuyPrice,
  triggerColRatioToSell,
  nextSellPrice,
  afterTargetMultiple,
  triggerColRatioToBuyToBuy,
  afterTriggerColRatioToSell,
}: ConstantMultipleDetailsLayoutProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const isMultiplyVault = vaultType === VaultType.Multiply

  return (
    <Grid>
      {isTriggerEnabled ||
      activeAutomationFeature?.currentOptimizationFeature ===
        AutomationFeatures.CONSTANT_MULTIPLE ? (
        <DetailsSection
          title={t('constant-multiple.title')}
          badge={isTriggerEnabled}
          content={
            <DetailsSectionContentCardWrapper>
              <ContentCardTargetMultiple
                targetMultiple={targetMultiple}
                afterTargetMultiple={afterTargetMultiple}
                targetColRatio={targetColRatio}
                changeVariant="positive"
              />
              <ContentCardOperatingCost totalCost={totalCost} PnLSinceEnabled={PnLSinceEnabled} />
              <ContentCardTriggerColRatioToBuy
                token={token}
                triggerColRatio={triggerColRatioToBuy}
                afterTriggerColRatio={triggerColRatioToBuyToBuy}
                nextBuyPrice={nextBuyPrice}
                changeVariant="positive"
              />
              <ContentCardTriggerColRatioToSell
                token={token}
                triggerColRatio={triggerColRatioToSell}
                afterTriggerColRatio={afterTriggerColRatioToSell}
                nextSellPrice={nextSellPrice}
                changeVariant="positive"
              />
            </DetailsSectionContentCardWrapper>
          }
        />
      ) : (
        <>
          {isMultiplyVault && (
            <Banner
              title={t('constant-multiple.banner.header')}
              description={
                <>
                  {t('constant-multiple.banner.content')}{' '}
                  <AppLink
                    href="https://kb.oasis.app/help/what-is-constant-multiple"
                    sx={{ fontSize: 2 }}
                  >
                    {t('here')}.
                  </AppLink>
                </>
              }
              image={{
                src: '/static/img/setup-banner/constant-multiply.svg',
                backgroundColor: bannerGradientPresets.constantMultiply[0],
                backgroundColorEnd: bannerGradientPresets.constantMultiply[1],
              }}
              button={{
                action: () => {
                  uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
                    type: 'Optimization',
                    currentOptimizationFeature: AutomationFeatures.CONSTANT_MULTIPLE,
                  })
                },
                text: t('constant-multiple.banner.button'),
              }}
            />
          )}
        </>
      )}
    </Grid>
  )
}
