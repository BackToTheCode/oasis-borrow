import BigNumber from 'bignumber.js'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import { Banner, bannerGradientPresets } from 'apps/main/components/Banner'
import { DetailsSection } from 'apps/main/components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'apps/main/components/DetailsSectionContentCard'
import { ContentCardTriggerColPrice } from 'apps/main/components/vault/detailsSection/ContentCardTriggerColPrice'
import { ContentCardTriggerColRatio } from 'apps/main/components/vault/detailsSection/ContentCardTriggerColRatio'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'apps/main/features/automation/common/state/automationFeatureChange'
import { AutomationFeatures } from 'apps/main/features/automation/common/types'
import { useUIChanges } from 'apps/main/helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export interface AutoTakeProfitDetailsLayoutProps {
  afterTriggerColPrice?: BigNumber
  afterTriggerColRatio?: BigNumber
  currentColRatio: BigNumber
  estimatedProfit?: BigNumber
  isTriggerEnabled: boolean
  token: string
  triggerColPrice?: BigNumber
  triggerColRatio?: BigNumber
}

export function AutoTakeProfitDetailsLayout({
  afterTriggerColPrice,
  afterTriggerColRatio,
  currentColRatio,
  estimatedProfit,
  isTriggerEnabled,
  token,
  triggerColPrice,
  triggerColRatio,
}: AutoTakeProfitDetailsLayoutProps) {
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()

  return (
    <Grid>
      {isTriggerEnabled ||
      activeAutomationFeature?.currentOptimizationFeature === 'autoTakeProfit' ? (
        <DetailsSection
          title={t('auto-take-profit.title')}
          badge={isTriggerEnabled}
          content={
            <DetailsSectionContentCardWrapper>
              <ContentCardTriggerColPrice
                token={token}
                triggerColPrice={triggerColPrice}
                afterTriggerColPrice={afterTriggerColPrice}
                estimatedProfit={estimatedProfit}
                changeVariant="positive"
              />
              <ContentCardTriggerColRatio
                triggerColRatio={triggerColRatio}
                afterTriggerColRatio={afterTriggerColRatio}
                currentColRatio={currentColRatio}
                changeVariant="positive"
              />
            </DetailsSectionContentCardWrapper>
          }
        />
      ) : (
        <Banner
          title={t('auto-take-profit.banner.header')}
          description={t('auto-take-profit.banner.content')}
          image={{
            src: '/static/img/setup-banner/auto-take-profit.svg',
            backgroundColor: bannerGradientPresets.autoTakeProfit[0],
            backgroundColorEnd: bannerGradientPresets.autoTakeProfit[1],
          }}
          button={{
            action: () => {
              uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
                type: 'Optimization',
                currentOptimizationFeature: AutomationFeatures.AUTO_TAKE_PROFIT,
              })
            },
            text: t('auto-take-profit.banner.button'),
          }}
        />
      )}
    </Grid>
  )
}
