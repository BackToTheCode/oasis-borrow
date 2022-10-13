import BigNumber from 'bignumber.js'
import { TransactionDef } from 'apps/main/blockchain/calls/callsHelpers'
import { GasEstimationStatus, HasGasEstimation } from 'apps/main/helpers/form'
import { TX_DATA_CHANGE, TxPayloadChange } from 'apps/main/helpers/gasEstimate'
import { useObservable } from 'apps/main/helpers/observableHook'
import { WithChildren } from 'apps/main/helpers/types'
import { useUIChanges } from 'apps/main/helpers/uiChangesHook'
import { zero } from 'apps/main/helpers/zero'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { of } from 'rxjs'

import { isAppContextAvailable, useAppContext } from './AppContextProvider'

export type GasEstimationContext = {
  isSuccessful: boolean
  isCompleted: boolean
  gasAmount: BigNumber
  usdValue: BigNumber
}

export const gasEstimationContext = createContext<GasEstimationContext | undefined>(undefined)

export const useGasEstimationContext = () => useContext(gasEstimationContext)

/*
  This component is providing data regarding gas based on txData received from uiChanges.
*/

export function GasEstimationContextProvider({ children }: WithChildren) {
  if (!isAppContextAvailable()) {
    return null
  }
  const [gasEstimate, setEstimate] = useState<GasEstimationContext | undefined>(undefined)
  const { addGasEstimation$ } = useAppContext()

  const [txData] = useUIChanges<TxPayloadChange>(TX_DATA_CHANGE)

  const gasEstimationData$ = useMemo(() => {
    if (!txData) {
      return of(undefined)
    }

    return addGasEstimation$(
      { gasEstimationStatus: GasEstimationStatus.unset },
      ({ estimateGas }) =>
        estimateGas(txData!.transaction as TransactionDef<typeof txData.data>, txData.data),
    )
  }, [txData])

  const [gasEstimationData] = useObservable(gasEstimationData$)

  const estimate: HasGasEstimation | undefined = gasEstimationData
    ? (gasEstimationData as HasGasEstimation)
    : undefined

  useEffect(() => {
    setEstimate({
      gasAmount: estimate ? new BigNumber(estimate.gasEstimation!) : zero,
      isSuccessful: !!estimate && estimate.gasEstimationStatus === GasEstimationStatus.calculated,
      usdValue: estimate?.gasEstimationUsd ? estimate.gasEstimationUsd : zero,
      isCompleted:
        !!estimate &&
        (estimate.gasEstimationStatus === GasEstimationStatus.error ||
          estimate.gasEstimationStatus === GasEstimationStatus.calculated),
    })
  }, [gasEstimationData])

  return (
    <gasEstimationContext.Provider value={gasEstimate}>{children}</gasEstimationContext.Provider>
  )
}
