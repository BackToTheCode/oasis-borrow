import { WithWalletConnection } from 'apps/main/components/connectWallet/ConnectWallet'
import { AppLayout } from 'apps/main/components/Layouts'
import { AaveOpenView } from 'apps/main/features/earn/aave/open/containers/AaveOpenView'
import { Survey } from 'apps/main/features/survey'
import { WithTermsOfService } from 'apps/main/features/termsOfService/TermsOfService'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'apps/main/theme/BackgroundLight'

import { AaveContextProvider } from '../../../features/earn/aave/AaveContextProvider'

export async function getStaticProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
    },
  }
}

function OpenVault() {
  // TODO: Move to dynamic props once earn paths agreed
  const strategyName = 'aave-steth'

  return (
    <AaveContextProvider>
      <WithWalletConnection>
        <WithTermsOfService>
          <BackgroundLight />

          <AaveOpenView strategyName={strategyName} />

          <Survey for="earn" />
        </WithTermsOfService>
      </WithWalletConnection>
    </AaveContextProvider>
  )
}

OpenVault.layout = AppLayout

export default OpenVault
