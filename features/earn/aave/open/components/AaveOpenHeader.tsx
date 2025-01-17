import { useActor, useSelector } from '@xstate/react'
import BigNumber from 'bignumber.js'
import { getPriceChangeColor } from 'components/vault/VaultDetails'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatHugeNumbersToShortHuman, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ActorRefFrom } from 'xstate'

import { useAaveContext } from '../../AaveContextProvider'
import { PreparedAaveReserveData } from '../../helpers/aavePrepareAaveTotalValueLocked'
import { useOpenAaveStateMachineContext } from '../containers/AaveOpenStateMachineContext'
import { AaveStEthSimulateStateMachine } from '../state'

export function AaveOpenHeader({
  simulationActor,
  strategyName,
  aaveTVL,
}: {
  simulationActor: ActorRefFrom<AaveStEthSimulateStateMachine>
  aaveTVL: PreparedAaveReserveData
  strategyName: string
}) {
  const { t } = useTranslation()
  const tokenPairList = {
    'aave-steth': {
      name: t('open-earn.aave.product-header.token-pair-list.aave-steth-eth'),
      tokenList: ['AAVE', 'STETH', 'ETH'],
    },
  } as Record<string, { name: string; tokenList: string[] }>

  const [simulationState] = useActor(simulationActor)

  const { context: simulationContext } = simulationState

  const headlineDetails = []
  if (simulationContext.yieldsMin && simulationContext.yieldsMax) {
    const formatYield = (yieldVal: BigNumber) =>
      formatPercent(yieldVal, {
        precision: 2,
      })
    const yield7DaysMin = simulationContext.yieldsMin.annualisedYield7days!
    const yield7DaysMax = simulationContext.yieldsMax.annualisedYield7days!

    const yield7DaysDiff = simulationContext.yieldsMax.annualisedYield7days!.minus(
      simulationContext.yieldsMax.annualisedYield7daysOffset!,
    )

    headlineDetails.push({
      label: t('open-earn.aave.product-header.current-yield'),
      value: `${formatYield(yield7DaysMin).toString()} - ${formatYield(yield7DaysMax).toString()}`,
      sub: formatPercent(yield7DaysDiff, {
        precision: 2,
        plus: true,
      }),
      subColor: getPriceChangeColor({
        collateralPricePercentageChange: yield7DaysDiff,
      }),
    })
  }
  if (simulationContext.yieldsMax?.annualisedYield90days) {
    const yield90DaysDiff = simulationContext.yieldsMax.annualisedYield90daysOffset!.minus(
      simulationContext.yieldsMax.annualisedYield90days,
    )
    headlineDetails.push({
      label: t('open-earn.aave.product-header.90-day-avg-yield'),
      value: formatPercent(simulationContext.yieldsMax.annualisedYield90days, {
        precision: 2,
      }),
      sub: formatPercent(yield90DaysDiff, {
        precision: 2,
        plus: true,
      }),
      subColor: getPriceChangeColor({
        collateralPricePercentageChange: yield90DaysDiff,
      }),
    })
  }

  aaveTVL?.totalValueLocked &&
    headlineDetails.push({
      label: t('open-earn.aave.product-header.total-value-locked'),
      value: formatHugeNumbersToShortHuman(aaveTVL.totalValueLocked),
    })

  return (
    <VaultHeadline
      header={tokenPairList[strategyName].name}
      token={tokenPairList[strategyName].tokenList}
      details={headlineDetails}
      loading={!aaveTVL?.totalValueLocked || simulationState.value === 'loading'}
    />
  )
}

export function AaveOpenHeaderComponent({ strategyName }: { strategyName: string }) {
  const { stateMachine: openAaveStateMachine } = useOpenAaveStateMachineContext()
  const simulationMachine = useSelector(openAaveStateMachine, (state) => {
    return state.context.refSimulationMachine
  })

  const { aaveTotalValueLocked$ } = useAaveContext()
  const [tvlState, tvlStateError] = useObservable(aaveTotalValueLocked$)

  return (
    <WithErrorHandler error={[tvlStateError]}>
      <WithLoadingIndicator value={[tvlState, simulationMachine]} customLoader={<AppSpinner />}>
        {([_tvlState, _simulationMachine]) => (
          <AaveOpenHeader
            strategyName={strategyName}
            simulationActor={_simulationMachine}
            aaveTVL={_tvlState}
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
