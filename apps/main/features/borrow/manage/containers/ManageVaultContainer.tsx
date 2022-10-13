import { trackingEvents } from 'apps/main/analytics/analytics'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import { DefaultVaultHeader } from 'apps/main/components/vault/DefaultVaultHeader'
import { VaultViewMode } from 'apps/main/components/vault/GeneralManageTabBar'
import { SidebarManageBorrowVault } from 'apps/main/features/borrow/manage/sidebars/SidebarManageBorrowVault'
import { TAB_CHANGE_SUBJECT } from 'apps/main/features/generalManageVault/TabChange'
import { VaultHistoryView } from 'apps/main/features/vaultHistory/VaultHistoryView'
import { useFeatureToggle } from 'apps/main/helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

import { ManageStandardBorrowVaultState } from '../pipes/manageVault'
import { createManageVaultAnalytics$ } from '../pipes/manageVaultAnalytics'
import { ManageVaultDetails } from './ManageVaultDetails'

export function ManageVaultContainer({
  manageVault,
}: {
  manageVault: ManageStandardBorrowVaultState
}) {
  const { manageVault$, context$, uiChanges } = useAppContext()
  const {
    vault: { id, ilk, token },
    clear,
    ilkData,
    priceInfo,
  } = manageVault
  const { t } = useTranslation()
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')

  useEffect(() => {
    const subscription = createManageVaultAnalytics$(
      manageVault$(id),
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      !stopLossReadEnabled && clear()
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      {!stopLossReadEnabled && (
        <DefaultVaultHeader
          header={t('vault.header', { ilk, id })}
          id={id}
          ilkData={ilkData}
          token={token}
          priceInfo={priceInfo}
        />
      )}
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          <ManageVaultDetails
            {...manageVault}
            onBannerButtonClickHandler={() => {
              uiChanges.publish(TAB_CHANGE_SUBJECT, {
                type: 'change-tab',
                currentMode: VaultViewMode.Protection,
              })
            }}
          />
          {!stopLossReadEnabled && <VaultHistoryView vaultHistory={manageVault.vaultHistory} />}
        </Grid>
        <Box>
          <SidebarManageBorrowVault {...manageVault} />
        </Box>
      </Grid>
    </>
  )
}
