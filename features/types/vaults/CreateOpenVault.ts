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

export interface CreateOpenVault {
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
    proxyActionsAdapterResolver$: ({
      ilk,
    }: {
      ilk: string
    }) => Observable<ProxyActionsSmartContractAdapterInterface>,
    ilk: string
}

export interface CreateOpenMultiplyVault extends CreateOpenVault {
  slippageLimit$: Observable<UserSettingsState>
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
    exchangeType: ExchangeType,
  ) => Observable<Quote>
}
