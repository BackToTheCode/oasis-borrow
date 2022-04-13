import BigNumber from "bignumber.js"
import { ProxyActionsSmartContractAdapterInterface } from "blockchain/calls/proxyActions/adapters/ProxyActionsSmartContractAdapterInterface"
import { IlkData } from "blockchain/ilks"
import { ContextConnected } from 'blockchain/network'
import { AddGasEstimationFunction,TxHelpers } from "components/AppContext"
import { ExchangeAction, ExchangeType, Quote } from "features/exchange/exchange"
import { BalanceInfo } from "features/shared/balanceInfo"
import { PriceInfo } from "features/shared/priceInfo"
import { UserSettingsState } from "features/userSettings/userSettings"
import { Observable } from "rxjs"

export interface CreateBaseOpenVault {
  connectedContext$: Observable<ContextConnected>
  txHelpers$: Observable<TxHelpers>
  proxyAddress$: (address: string) => Observable<string | undefined>
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>
  priceInfo$: (token: string) => Observable<PriceInfo>
  balanceInfo$: (token: string, address: string | undefined) => Observable<BalanceInfo>
  ilks$: Observable<string[]>
  ilkData$: (ilk: string) => Observable<IlkData>
  ilkToToken$: (ilk: string) => Observable<string>
  addGasEstimation$: AddGasEstimationFunction,
  ilk: string
}

export interface CreateOpenBorrowVault extends CreateBaseOpenVault {
    proxyActionsAdapterResolver$: ({
      ilk,
    }: {
      ilk: string
    }) => Observable<ProxyActionsSmartContractAdapterInterface>,

}

export interface CreateOpenMultiplyVault extends CreateBaseOpenVault {
  proxyActionsAdapterResolver$: ({
    ilk,
  }: {
    ilk: string
  }) => Observable<ProxyActionsSmartContractAdapterInterface>,
  slippageLimit$: Observable<UserSettingsState>
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
    exchangeType: ExchangeType,
  ) => Observable<Quote>
}

export interface CreateOpenGuniVault extends CreateBaseOpenVault {
  slippageLimit$: Observable<UserSettingsState>
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
    exchangeType: ExchangeType,
  ) => Observable<Quote>
  token1Balance$: (args: { token: string; leveragedAmount: BigNumber }) => Observable<BigNumber>,
  getGuniMintAmount$: (args: {
    token: string
    amountOMax: BigNumber
    amount1Max: BigNumber
  }) => Observable<{ amount0: BigNumber; amount1: BigNumber; mintAmount: BigNumber }>,
}
