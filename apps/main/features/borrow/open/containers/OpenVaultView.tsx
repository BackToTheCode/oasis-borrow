import { trackingEvents } from 'apps/main/analytics/analytics'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import { DefaultVaultHeader } from 'apps/main/components/vault/DefaultVaultHeader'
import { SidebarOpenBorrowVault } from 'apps/main/features/borrow/open/sidebars/SidebarOpenBorrowVault'
import { WithLoadingIndicator } from 'apps/main/helpers/AppSpinner'
import { WithErrorHandler } from 'apps/main/helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'apps/main/helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Container, Grid } from 'theme-ui'

import { OpenVaultState } from '../pipes/openVault'
import { createOpenVaultAnalytics$ } from '../pipes/openVaultAnalytics'
import { OpenVaultDetails } from './OpenVaultDetails'

function OpenVaultForm(props: OpenVaultState) {
  return (
    <>
      <SidebarOpenBorrowVault {...props} />
    </>
  )
}

export function OpenVaultContainer(props: OpenVaultState) {
  const { ilk, clear } = props
  const { t } = useTranslation()

  useEffect(() => {
    return () => {
      clear()
    }
  }, [])

  return (
    <>
      <DefaultVaultHeader {...props} header={t('vault.open-vault', { ilk })} />
      <Grid variant="vaultContainer">
        <Box>
          <OpenVaultDetails {...props} />
        </Box>
        <Box>
          <OpenVaultForm {...props} />
        </Box>
      </Grid>
    </>
  )
}

export function OpenVaultView({ ilk }: { ilk: string }) {
  const { openVault$, accountData$, context$ } = useAppContext()
  const openVaultWithIlk$ = openVault$(ilk)
  const [openVault, error] = useObservable(openVaultWithIlk$)

  useEffect(() => {
    const subscription = createOpenVaultAnalytics$(
      accountData$,
      openVaultWithIlk$,
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <WithErrorHandler error={error}>
      <WithLoadingIndicator value={openVault}>
        {(openVault) => (
          <Container variant="vaultPageContainer">
            <OpenVaultContainer {...openVault} />
          </Container>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}