import { WithConnection } from 'apps/main/components/connectWallet/ConnectWallet'
import { PageSEOTags } from 'apps/main/components/HeadTags'
import { AppLayout } from 'apps/main/components/Layouts'
import { ReferralLandingSummary } from 'apps/main/features/referralOverview/ReferralLanding'
import { useFeatureToggle } from 'apps/main/helpers/useFeatureToggle'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
    },
  }
}

function ReferralsPage() {
  const referralsEnabled = useFeatureToggle('Referrals')

  return (
    <>
      <WithConnection>{referralsEnabled ? <ReferralLandingSummary /> : null}</WithConnection>
    </>
  )
}

ReferralsPage.layout = AppLayout
ReferralsPage.seoTags = (
  <PageSEOTags
    title="seo.referrals.title"
    description="seo.referrals.description"
    url="/referrals"
  />
)
export default ReferralsPage
