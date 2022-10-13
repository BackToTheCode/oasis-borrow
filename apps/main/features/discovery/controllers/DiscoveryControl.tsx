import { getDiscoveryData } from 'apps/main/features/discovery/api'
import { DiscoveryFilters } from 'apps/main/features/discovery/common/DiscoveryFilters'
import { DiscoveryTable } from 'apps/main/features/discovery/common/DiscoveryTable'
import { getDefaultSettingsState } from 'apps/main/features/discovery/helpers'
import { discoveryPagesMeta } from 'apps/main/features/discovery/meta'
import { DiscoveryFiltersSettings, DiscoveryPages } from 'apps/main/features/discovery/types'
import { keyBy } from 'lodash'
import React, { useState } from 'react'
import { Box } from 'theme-ui'

interface DiscoveryControlProps {
  kind: DiscoveryPages
}

export function DiscoveryControl({ kind }: DiscoveryControlProps) {
  const { banner, endpoint, filters } = keyBy(discoveryPagesMeta, 'kind')[kind]
  const [settings, setSettings] = useState<DiscoveryFiltersSettings>(
    getDefaultSettingsState({ filters }),
  )
  const discoveryData = getDiscoveryData(endpoint, settings)

  return (
    <Box
      sx={{
        backgroundColor: 'neutral10',
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: 'large',
      }}
    >
      <DiscoveryFilters
        filters={filters}
        onChange={(key, currentValue) => {
          setSettings({
            ...settings,
            [key]: currentValue.value,
          })
        }}
      />
      {discoveryData?.data?.rows && (
        <DiscoveryTable banner={banner} kind={kind} rows={discoveryData.data.rows} />
      )}
    </Box>
  )
}
