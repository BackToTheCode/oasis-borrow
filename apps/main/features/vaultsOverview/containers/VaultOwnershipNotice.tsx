import { Context } from 'apps/main/blockchain/network'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import { VaultOverviewOwnershipNotice } from 'apps/main/features/notices/VaultsNoticesView'
import { WithLoadingIndicator } from 'apps/main/helpers/AppSpinner'
import { WithErrorHandler } from 'apps/main/helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'apps/main/helpers/observableHook'
import React from 'react'

interface Props {
  address: string
}

export function VaultOwnershipNotice({ address }: Props) {
  const { context$ } = useAppContext()
  const [context, contextError] = useObservable(context$)

  return (
    <WithErrorHandler error={[contextError]}>
      <WithLoadingIndicator value={[context]}>
        {([_context]) => <VaultOwnershipNoticeView address={address} context={_context} />}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

interface ViewProps {
  context: Context
  address: string
}

function VaultOwnershipNoticeView({ address, context }: ViewProps) {
  const connectedAccount = context?.status === 'connected' ? context.account : undefined

  if (connectedAccount && address !== connectedAccount) {
    return <VaultOverviewOwnershipNotice account={connectedAccount} controller={address} />
  }
  return null
}
