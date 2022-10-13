import { getToken } from 'apps/main/blockchain/tokensMetadata'
import { getTokenAth$ } from 'apps/main/features/tokenAth/tokenAthApi'
import { useObservable } from 'apps/main/helpers/observableHook'
import { useMemo } from 'react'

export function createTokenAth(token: string) {
  const coinGeckoId = getToken(token).coinGeckoId || ''
  const tokenAth$ = useMemo(() => getTokenAth$(coinGeckoId), [token])
  const [tokenAth] = useObservable(tokenAth$)

  return tokenAth?.ath
}
