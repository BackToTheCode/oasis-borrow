import { WithWalletConnection } from 'apps/main/components/connectWallet/ConnectWallet'
import { AppLayout } from 'apps/main/components/Layouts'
import { OpenMultiplyVaultView } from 'apps/main/features/multiply/open/containers/OpenMultiplyVaultView'
import { Survey } from 'apps/main/features/survey'
import { WithTermsOfService } from 'apps/main/features/termsOfService/TermsOfService'
import { GetServerSidePropsContext, GetStaticPaths } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { WithWalletAssociatedRisk } from '../../../features/walletAssociatedRisk/WalletAssociatedRisk'
import { supportedMultiplyIlks } from '../../../helpers/productCards'

export const getStaticPaths: GetStaticPaths<{ ilk: string }> = async () => {
  const paths = supportedMultiplyIlks.map((ilk) => ({ params: { ilk } })) // these paths will be generated at built time
  return {
    paths,
    fallback: true,
  }
}

export async function getStaticProps(ctx: GetServerSidePropsContext & { params: { ilk: string } }) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      ilk: ctx.params.ilk || null,
    },
  }
}

function OpenVault({ ilk }: { ilk: string }) {
  return (
    <WithWalletConnection>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          <OpenMultiplyVaultView ilk={ilk} />
          <Survey for="multiply" />
        </WithWalletAssociatedRisk>
      </WithTermsOfService>
    </WithWalletConnection>
  )
}

OpenVault.layout = AppLayout

export default OpenVault
