import { useGasEstimationContext } from 'apps/main/components/GasEstimationContextProvider'
import { getEstimatedGasFeeText } from 'apps/main/components/vault/VaultChangesInformation'
import React from 'react'

export function GasEstimation() {
  const gasEstimation = useGasEstimationContext()

  return <>{getEstimatedGasFeeText(gasEstimation)}</>
}
