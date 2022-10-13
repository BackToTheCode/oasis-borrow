import { PageSEOTags } from 'apps/main/components/HeadTags'
import { MarketingLayout } from 'apps/main/components/Layouts'
import React from 'react'

export const discoveryPageLayout = MarketingLayout
export const discoveryPageLayoutProps = {
  topBackground: 'lighter',
}
export const discoveryPageSeoTags = (
  <PageSEOTags
    title="seo.discovery.title"
    description="seo.discovery.description"
    url="/discovery"
  />
)
