import { AppLink } from 'components/Links'
import { DiscoveryBanner } from 'features/discovery/meta'
import { DiscoveryPages } from 'features/discovery/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Flex, Heading, Text } from 'theme-ui'

export function DiscoveryTableBanner({
  kind,
  icon,
  link,
}: { kind: DiscoveryPages } & DiscoveryBanner) {
  const { t } = useTranslation()

  return (
    <Flex
      sx={{
        alignItems: 'center',
        py: 3,
        px: 4,
        borderRadius: 'medium',
        boxShadow: 'vaultDetailsCard',
      }}
    >
      <Box sx={{ flexShrink: 0, svg: { display: 'block' } }}>{icon}</Box>
      <Box sx={{ mx: 4 }}>
        <Heading as="h3" variant="boldParagraph2">
          {t(`discovery.table.banner.${kind}.title`)}
        </Heading>
        <Text as="p" variant="paragraph3" sx={{ mt: 1, color: 'neutral80' }}>
          {t(`discovery.table.banner.${kind}.description`)}
        </Text>
      </Box>
      <Box sx={{ flexShrink: 0 }}>
        <AppLink href={link}>
          <Button variant="action">{t(`discovery.table.banner.${kind}.cta`)}</Button>
        </AppLink>
      </Box>
    </Flex>
  )
}
