import { Icon } from '@makerdao/dai-ui-icons'
import { IlkData } from 'apps/main/blockchain/ilks'
import { Vault } from 'apps/main/blockchain/vaults'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import { useAutomationContext } from 'apps/main/components/AutomationContextProvider'
import { AppLink } from 'apps/main/components/Links'
import { OptimizationDetailsControl } from 'apps/main/features/automation/optimization/common/controls/OptimizationDetailsControl'
import { OptimizationFormControl } from 'apps/main/features/automation/optimization/common/controls/OptimizationFormControl'
import { VaultType } from 'apps/main/features/generalManageVault/vaultType'
import { VaultNotice } from 'apps/main/features/notices/VaultsNoticesView'
import { BalanceInfo } from 'apps/main/features/shared/balanceInfo'
import { VaultHistoryEvent } from 'apps/main/features/vaultHistory/vaultHistory'
import { VaultContainerSpinner, WithLoadingIndicator } from 'apps/main/helpers/AppSpinner'
import { WithErrorHandler } from 'apps/main/helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'apps/main/helpers/observableHook'
import { useFeatureToggle } from 'apps/main/helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { Container } from 'theme-ui'

import { DefaultVaultLayout } from './DefaultVaultLayout'

interface ZeroDebtOptimizationBannerProps {
  useTranslationKeys?: boolean
  header: string
  description: string
  showLink?: boolean
}

function ZeroDebtOptimizationBanner({
  useTranslationKeys = true,
  header,
  description,
  showLink = true,
}: ZeroDebtOptimizationBannerProps) {
  const { t } = useTranslation()

  return (
    <VaultNotice
      status={<Icon size="34px" name="warning" />}
      withClose={false}
      header={useTranslationKeys ? t(header) : header}
      subheader={
        <>
          {useTranslationKeys ? t(description) : description}
          {showLink && (
            <>
              {', '}
              <AppLink href="https://kb.oasis.app/help" sx={{ fontSize: 3 }}>
                {t('here')}.
              </AppLink>
            </>
          )}
        </>
      }
      color="primary100"
    />
  )
}
function getZeroDebtOptimizationBannerProps({
  readOnlyAutoBSEnabled,
  constantMultipleReadOnlyEnabled,
  isVaultDebtZero,
  vaultHasNoActiveBuyTrigger,
  vaultHasNoActiveConstantMultipleTriggers,
}: {
  readOnlyAutoBSEnabled: boolean
  constantMultipleReadOnlyEnabled: boolean
  isVaultDebtZero: boolean
  vaultHasNoActiveBuyTrigger?: boolean
  vaultHasNoActiveConstantMultipleTriggers?: boolean
}): ZeroDebtOptimizationBannerProps {
  if (!readOnlyAutoBSEnabled && !constantMultipleReadOnlyEnabled) {
    if (isVaultDebtZero && vaultHasNoActiveBuyTrigger && vaultHasNoActiveConstantMultipleTriggers) {
      return {
        header: 'optimization.zero-debt-heading',
        description: 'optimization.zero-debt-description',
      }
    } else
      return {
        header: 'optimization.unable-to-access-optimization',
        description: 'please-try-again-later',
        showLink: false,
      }
  } else {
    return {
      showLink: false,
      header: 'optimization.adding-new-triggers-disabled',
      description: 'optimization.adding-new-triggers-disabled-description',
    }
  }
}

interface OptimizationControlProps {
  vault: Vault
  vaultType: VaultType
  ilkData: IlkData
  balanceInfo: BalanceInfo
  vaultHistory: VaultHistoryEvent[]
}

export function OptimizationControl({
  vault,
  vaultType,
  ilkData,
  balanceInfo,
  vaultHistory,
}: OptimizationControlProps) {
  const { context$, txHelpers$, tokenPriceUSD$, priceInfo$ } = useAppContext()
  const priceInfoObs$ = useMemo(() => priceInfo$(vault.token), [vault.token])
  const [priceInfoData, priceInfoError] = useObservable(priceInfoObs$)
  const [txHelpersData, txHelpersError] = useObservable(txHelpers$)
  const [contextData, contextError] = useObservable(context$)
  const _tokenPriceUSD$ = useMemo(() => tokenPriceUSD$(['ETH', vault.token]), [vault.token])
  const [ethAndTokenPricesData, ethAndTokenPricesError] = useObservable(_tokenPriceUSD$)
  const readOnlyAutoBSEnabled = useFeatureToggle('ReadOnlyBasicBS')
  const constantMultipleReadOnlyEnabled = useFeatureToggle('ConstantMultipleReadOnly')
  const { autoBuyTriggerData, constantMultipleTriggerData } = useAutomationContext()

  const vaultHasActiveAutoBuyTrigger = autoBuyTriggerData.isTriggerEnabled
  const vaultHasActiveConstantMultipleTrigger = constantMultipleTriggerData.isTriggerEnabled

  if (
    (!vaultHasActiveAutoBuyTrigger &&
      !vaultHasActiveConstantMultipleTrigger &&
      vault.debt.isZero()) ||
    (!vaultHasActiveAutoBuyTrigger &&
      !vaultHasActiveConstantMultipleTrigger &&
      readOnlyAutoBSEnabled &&
      constantMultipleReadOnlyEnabled)
  ) {
    return (
      <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
        <ZeroDebtOptimizationBanner
          {...getZeroDebtOptimizationBannerProps({
            readOnlyAutoBSEnabled,
            isVaultDebtZero: vault.debt.isZero(),
            vaultHasNoActiveBuyTrigger: !vaultHasActiveAutoBuyTrigger,
            constantMultipleReadOnlyEnabled,
            vaultHasNoActiveConstantMultipleTriggers: !vaultHasActiveConstantMultipleTrigger,
          })}
        />
      </Container>
    )
  }

  return (
    <WithErrorHandler
      error={[ethAndTokenPricesError, contextError, txHelpersError, priceInfoError]}
    >
      <WithLoadingIndicator
        value={[contextData, ethAndTokenPricesData, priceInfoData]}
        customLoader={<VaultContainerSpinner />}
      >
        {([context, ethAndTokenPrices, priceInfo]) => (
          <DefaultVaultLayout
            detailsViewControl={
              <OptimizationDetailsControl
                vault={vault}
                vaultType={vaultType}
                vaultHistory={vaultHistory}
                ethMarketPrice={ethAndTokenPrices['ETH']}
                tokenMarketPrice={ethAndTokenPrices[vault.token]}
              />
            }
            editForm={
              <OptimizationFormControl
                vault={vault}
                vaultType={vaultType}
                ilkData={ilkData}
                txHelpers={txHelpersData}
                context={context}
                balanceInfo={balanceInfo}
                ethMarketPrice={ethAndTokenPrices['ETH']}
                tokenMarketPrice={ethAndTokenPrices[vault.token]}
                priceInfo={priceInfo}
              />
            }
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
