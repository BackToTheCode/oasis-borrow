import { WithConnection } from 'apps/main/components/connectWallet/ConnectWallet'
import { AppLayout } from 'apps/main/components/Layouts'
import { ReferralsSummary } from 'apps/main/features/referralOverview/ReferralOverviewView'
import { useFeatureToggle } from 'apps/main/helpers/useFeatureToggle'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      address: ctx.query?.address || null,
    },
  }
}

export default function ReferralsPage({ address }: { address: string }) {
  const referralsEnabled = useFeatureToggle('Referrals')
  return address ? (
    <WithConnection>
      {referralsEnabled ? <ReferralsSummary address={address} /> : null}
    </WithConnection>
  ) : null
}

ReferralsPage.layout = AppLayout
