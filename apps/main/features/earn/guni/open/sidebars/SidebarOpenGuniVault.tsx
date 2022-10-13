import { useAppContext } from 'apps/main/components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'apps/main/components/sidebar/SidebarSection'
import { SidebarVaultAllowanceStage } from 'apps/main/components/vault/sidebar/SidebarVaultAllowanceStage'
import { SidebarVaultProxyStage } from 'apps/main/components/vault/sidebar/SidebarVaultProxyStage'
import { OpenGuniVaultState } from 'apps/main/features/earn/guni/open/pipes/openGuniVault'
import { SidebarOpenGuniVaultEditingState } from 'apps/main/features/earn/guni/open/sidebars/SidebarOpenGuniVaultEditingState'
import { SidebarOpenGuniVaultOpenStage } from 'apps/main/features/earn/guni/open/sidebars/SidebarOpenGuniVaultOpenStage'
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
import React from 'react'
import { Grid } from 'theme-ui'

export function SidebarOpenGuniVault(props: OpenGuniVaultState) {
  const { accountData$ } = useAppContext()
  const [accountData] = useObservable(accountData$)

  const {
    canProgress,
    canRegress,
    currentStep,
    id,
    isAllowanceStage,
    isEditingStage,
    isLoadingStage,
    isOpenStage,
    isProxyStage,
    isSuccessStage,
    progress,
    regress,
    stage,
    token,
    totalSteps,
  } = props

  const flow: SidebarFlow = 'openGuni'
  const firstCDP = isFirstCdp(accountData)
  const gasData = extractGasDataFromState(props)
  const primaryButtonLabelParams = extractPrimaryButtonLabelParams(props)
  const sidebarTxData = extractSidebarTxData(props)
  const isProxyCreationDisabled = useFeatureToggle('ProxyCreationDisabled')

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token }),
    content: (
      <Grid gap={3}>
        {isEditingStage && <SidebarOpenGuniVaultEditingState {...props} />}
        {isProxyStage && <SidebarVaultProxyStage stage={stage} gasData={gasData} />}
        {isAllowanceStage && <SidebarVaultAllowanceStage {...props} token="DAI" />}
        {isOpenStage && <SidebarOpenGuniVaultOpenStage {...props} />}
      </Grid>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel({ ...primaryButtonLabelParams, flow }),
      steps: !isSuccessStage ? [currentStep, totalSteps] : undefined,
      disabled: !canProgress || (isProxyStage && isProxyCreationDisabled),
      isLoading: isLoadingStage,
      action: () => {
        if (!isSuccessStage) progress!()
        progressTrackingEvent({ props, firstCDP })
      },
      url: isSuccessStage ? `/${id}` : undefined,
    },
    textButton: {
      label: getTextButtonLabel({ flow, stage, token }),
      hidden: !canRegress || isSuccessStage,
      action: () => {
        if (canRegress) regress!()
        regressTrackingEvent({ props })
      },
    },
    status: getSidebarStatus({ flow, ...sidebarTxData }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
