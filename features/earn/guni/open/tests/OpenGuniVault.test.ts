import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { protoTxHelpers } from 'components/AppContext'
import { mockBalanceInfo$ } from 'helpers/mocks/balanceInfo.mock'
import { mockContextConnected } from 'helpers/mocks/context.mock'
import { mockIlkData$, mockIlkToToken$ } from 'helpers/mocks/ilks.mock'
import { mockPriceInfo$ } from 'helpers/mocks/priceInfo.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import { Observable, of } from 'rxjs'

import { mockExchangeQuote$ } from '../../../../../helpers/mocks/exchangeQuote.mock'
import { addGasEstimationMock } from '../../../../../helpers/mocks/openVault.mock'
import { slippageLimitMock } from '../../../../../helpers/mocks/slippageLimit.mock'
import { GUNI_SLIPPAGE } from '../../../../../helpers/multiply/calculations'
import { createOpenGuniVault$ } from '../pipes/openGuniVault'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function proxyAddress$(address: string) {
  return of(undefined)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function allowance$(address: string) {
  return of(new BigNumber(0))
}

function ilks$() {
  return of(['GUNIV3DAIUSDC1'])
}

function ilkData$() {
  return mockIlkData$({
    ilk: 'GUNIV3DAIUSDC1',
    _priceInfo$: mockPriceInfo$(),
    liquidationRatio: new BigNumber(1.05),
  })
}

function token1Balance$() {
  return of(new BigNumber(8.549))
}

function getGuniMintAmount$() {
  return of({
    amount0: new BigNumber(58604),
    amount1: new BigNumber(12820),
    mintAmount: new BigNumber(69.96),
  })
}

describe('OpenGuniVault', () => {
  it('playground', () => {
    const openGuniVault$ = createOpenGuniVault$({
      connectedContext$: of(mockContextConnected),
      txHelpers$: of(protoTxHelpers),
      proxyAddress$,
      allowance$,
      priceInfo$: (token: string) => mockPriceInfo$({ token }),
      balanceInfo$: (address?: string) => mockBalanceInfo$({ address }),
      ilks$: ilks$(),
      ilkToToken$: mockIlkToToken$,
      ilkData$: () => ilkData$(),
      exchangeQuote$: mockExchangeQuote$(),
      addGasEstimation$: addGasEstimationMock,
      ilk: 'GUNIV3DAIUSDC1',
      token1Balance$,
      getGuniMintAmount$,
      slippageLimit$: slippageLimitMock(),
    })

    const state = getStateUnpacker(openGuniVault$)

    console.log(state)
  })

  it('uses default GUNI slippage', () => {
    const openGuniVault$ = createOpenGuniVault$({
      connectedContext$: of(mockContextConnected),
      txHelpers$: of(protoTxHelpers),
      proxyAddress$,
      allowance$,
      priceInfo$: (token: string) => mockPriceInfo$({ token }),
      balanceInfo$: (address?: string) => mockBalanceInfo$({ address }),
      ilkToToken$: mockIlkToToken$,
      ilks$: ilks$(),
      ilkData$: () => ilkData$(),
      exchangeQuote$: mockExchangeQuote$(),
      addGasEstimation$: addGasEstimationMock,
      ilk: 'GUNIV3DAIUSDC1',
      token1Balance$,
      getGuniMintAmount$,
      slippageLimit$: slippageLimitMock(),
    })

    const state = getStateUnpacker(openGuniVault$)()

    expect(state.slippage).to.equal(GUNI_SLIPPAGE)
  })
})
