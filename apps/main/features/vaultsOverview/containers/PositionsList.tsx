import { useAppContext } from 'apps/main/components/AppContextProvider'
import { PositionList, PositionVM } from 'apps/main/components/dumb/PositionList'
import { getAddress } from 'ethers/lib/utils'
import { WithLoadingIndicator } from 'apps/main/helpers/AppSpinner'
import { WithErrorHandler } from 'apps/main/helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'apps/main/helpers/observableHook'
import React from 'react'
import { Card } from 'theme-ui'

function PositionsListView({ positions }: { positions: PositionVM[] }) {
  const numberOfVaults = positions.length

  if (numberOfVaults !== 0) {
    return (
      <Card
        variant="positionsPage"
        sx={{
          mb: 4,
        }}
      >
        <PositionList positions={positions} />
      </Card>
    )
  }

  return null
}

export function PositionsList({ address }: { address: string }) {
  const { vaultsOverview$ } = useAppContext()
  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const [vaultsOverview, vaultsOverviewError] = useObservable(vaultsOverview$(checksumAddress))

  return (
    <WithErrorHandler error={[vaultsOverviewError]}>
      <WithLoadingIndicator value={[vaultsOverview]}>
        {([{ positions }]) => <PositionsListView positions={positions} />}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
