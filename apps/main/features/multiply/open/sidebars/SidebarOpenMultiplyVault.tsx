import { useAppContext } from 'apps/main/components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'apps/main/components/sidebar/SidebarSection'
import { SidebarVaultAllowanceStage } from 'apps/main/components/vault/sidebar/SidebarVaultAllowanceStage'
import { SidebarVaultProxyStage } from 'apps/main/components/vault/sidebar/SidebarVaultProxyStage'
import { SidebarVaultStopLossStage } from 'apps/main/components/vault/sidebar/SidebarVaultStopLossStage'
import { getDataForStopLoss } from 'apps/main/features/automation/protection/stopLoss/openFlow/openVaultStopLoss'
import { SidebarAdjustStopLossEditingStage } from 'apps/main/features/automation/protection/stopLoss/sidebars/SidebarAdjustStopLossEditingStage'
import { OpenMultiplyVaultState } from 'apps/main/features/multiply/open/pipes/openMultiplyVault'
import { SidebarOpenMultiplyVaultEditingState } from 'apps/main/features/multiply/open/sidebars/SidebarOpenMultiplyVaultEditingState'
import { SidebarOpenMultiplyVaultOpenStage } from 'apps/main/features/multiply/open/sidebars/SidebarOpenMultiplyVaultOpenStage'
import { getPrimaryButtonLabel } from 'apps/main/features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'apps/main/features/sidebar/getSidebarStatus'
import { getSidebarTitle } from 'apps/main/features/sidebar/getSidebarTitle'
import { getTextButtonLabel } from 'apps/main/features/sidebar/getTextButtonLabel'
import { progressTrackingEvent, regressTrackingEvent } from 'apps/main/features/sidebar/trackingEvents'
import { SidebarFlow } from 'apps/main/features/types/vaults/sidebarLabels'
import { extractGasDataFromState } from 'apps/main/helpers/extractGasDataFromState'
import {
  extractPrimaryButtonLabelParams,
  extractSidebarTxData,
} from 'apps/main/helpers/extractSidebarHelpers'
import { isFirstCdp } from 'apps/main/helpers/isFirstCdp'
import { useObservable } from 'apps/main/helpers/observableHook'
import { useFeatureToggle } from 'apps/main/helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function SidebarOpenMultiplyVault(props: OpenMultiplyVaultState) {
  const { t } = useTranslation()
  const { accountData$ } = useAppContext()
  const [accountData] = useObservable(accountData$)

  const {
    canProgress,
    canRegress,
    currentStep,
    id,
    ilk,
    isAllowanceStage,
    isEditingStage,
    isLoadingStage,
    isOpenStage,
    isProxyStage,
    isStopLossEditingStage,
    isSuccessStage,
    progress,
    regress,
    stage,
    token,
    totalSteps,
    isStopLossSuccessStage,
    openFlowWithStopLoss,
    isAddStopLossStage,
    skipStopLoss,
  } = props

  const flow: SidebarFlow = !isStopLossEditingStage ? 'openMultiply' : 'addSl'
  const firstCDP = isFirstCdp(accountData)
  const gasData = extractGasDataFromState(props)

  const primaryButtonLabelParams = extractPrimaryButtonLabelParams(props)
  const sidebarTxData = extractSidebarTxData(props)
  const stopLossData = getDataForStopLoss(props, 'multiply')
  const isProxyCreationDisabled = useFeatureToggle('ProxyCreationDisabled')

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token, openFlowWithStopLoss }),
    content: (
      <Grid gap={3}>
        {isEditingStage && <SidebarOpenMultiplyVaultEditingState {...props} />}
        {isStopLossEditingStage && <SidebarAdjustStopLossEditingStage {...stopLossData} />}
        {isProxyStage && <SidebarVaultProxyStage stage={stage} gasData={gasData} />}
        {isAllowanceStage && <SidebarVaultAllowanceStage {...props} />}
        {isOpenStage && <SidebarOpenMultiplyVaultOpenStage {...props} />}
        {isAddStopLossStage && <SidebarVaultStopLossStage {...props} />}
      </Grid>
    ),
    ...(isStopLossEditingStage && {
      headerButton: {
        label: t('protection.continue-without-stop-loss'),
        action: () => skipStopLoss!(),
      },
    }),
    primaryButton: {
      label: getPrimaryButtonLabel({ ...primaryButtonLabelParams, flow }),
      steps: !isSuccessStage && !isAddStopLossStage ? [currentStep, totalSteps] : undefined,
      disabled: !canProgress || (isProxyStage && isProxyCreationDisabled),
      isLoading: isLoadingStage,
      action: () => {
        if (!isSuccessStage && !isStopLossSuccessStage) progress!()
        progressTrackingEvent({ props, firstCDP })
      },
      url:
        (isSuccessStage && !openFlowWithStopLoss) || isStopLossSuccessStage ? `/${id}` : undefined,
    },
    textButton: {
      label: getTextButtonLabel({ flow, stage, token }),
      hidden: (!canRegress || isSuccessStage) && !isEditingStage,
      action: () => {
        if (canRegress) regress!()
        regressTrackingEvent({ props })
      },
      url: !canRegress && isEditingStage ? `/vaults/open/${ilk}` : undefined,
    },
    status: getSidebarStatus({ flow, ...sidebarTxData }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
