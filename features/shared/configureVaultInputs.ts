import BigNumber from 'bignumber.js'
import { ProxyActionsSmartContractAdapterInterface } from 'blockchain/calls/proxyActions/adapters/ProxyActionsSmartContractAdapterInterface'
import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { UserSettingsState } from 'features/userSettings/userSettings'
import { iif, Observable, of, pipe, throwError } from 'rxjs'
import { combineLatestObject } from 'rxjs-etc'
import { switchMap } from 'rxjs/operators'
import { TypeOf } from 'zod'

declare module 'rxjs/internal/util/pipe' {
  export function pipe<T>(
    ...operators: any[]
  ): <R extends T>(source: Observable<R>) => Observable<R>
}

export function validateIlk(ilk: string) {
  return pipe(
    switchMap(({ ilks, ...rest }: { ilks: string[] }) =>
      iif(
        () => !ilks.some((i) => i === ilk),
        throwError(new Error(`Ilk ${ilk} does not exist`)),
        of(rest),
      ),
    ),
  )
}

type ConfigureBaseVaultInputs = {
  connectedContext$: Observable<ContextConnected>
  txHelpers$: Observable<TxHelpers>
  priceInfo$: (token: string) => Observable<PriceInfo>
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>
  balanceInfo$: (token: string, address: string | undefined) => Observable<BalanceInfo>
  ilkData$: (ilk: string) => Observable<IlkData>
  proxyAddress$: (address: string) => Observable<string | undefined>
  addGasEstimation$: AddGasEstimationFunction
  ilkToToken$: (ilk: string) => Observable<string>
  ilks$: Observable<string[]>
  ilk: string
}

type ConfigureBorrowVaultInputs = ConfigureBaseVaultInputs & {
  proxyActionsAdapterResolver$: ({
    ilk,
  }: {
    ilk: string
  }) => Observable<ProxyActionsSmartContractAdapterInterface>
}

type ConfigureMultiplyVaultInputs = ConfigureBaseVaultInputs & {
  slippageLimit$: Observable<UserSettingsState>
}

// type ConfigureGuniVaultInputs = ConfigureBaseVaultInputs & {
//   psmExchangeQuote$: (
//     token: string,
//     slippage: BigNumber,
//     amount: BigNumber,
//     action: ExchangeAction,
//     exchangeType: ExchangeType,
//   ) => createExchangeQuote$(context$, 'PSM', token, slippage, amount, action, exchangeType)
// }

type BaseVaultInputsReturn = {
  context: ContextConnected
  txHelpers: TxHelpers
  token: string
  account: string
  priceInfo: PriceInfo
  balanceInfo: BalanceInfo
  ilkData: IlkData
  ilks: string[]
  allowance: BigNumber | undefined
  proxyAddress: string | undefined
}

type BorrowVaultInputsReturn = BaseVaultInputsReturn & {
  proxyActionsAdapter: ProxyActionsSmartContractAdapterInterface
}

type MultiplyVaultInputsReturn = BaseVaultInputsReturn & { slippageLimit: UserSettingsState }

type GuniVaultInputsReturn = BaseVaultInputsReturn

export function configureBaseVaultInputs({
  connectedContext$,
  txHelpers$,
  priceInfo$,
  balanceInfo$,
  allowance$,
  ilkData$,
  proxyAddress$,
  addGasEstimation$,
  ilkToToken$,
  ilks$,
  ilk,
}: ConfigureBaseVaultInputs): Observable<BaseVaultInputsReturn> {
  return combineLatestObject({ context: connectedContext$, token: ilkToToken$(ilk) }).pipe(
    switchMap(({ context, token }: { context: ContextConnected; token: string }) => {
      const account = context.account

      return combineLatestObject({
        context: connectedContext$,
        txHelpers: txHelpers$,
        token: of(token),
        account: of(account),
        priceInfo: priceInfo$(token),
        balanceInfo: balanceInfo$(token, account),
        ilkData: ilkData$(ilk),
        proxyAddress: proxyAddress$(account),
        addGasEstimation: addGasEstimation$,
        ilks: ilks$,
      })
    }),
    switchMap(
      ({
        context,
        txHelpers,
        token,
        account,
        priceInfo,
        balanceInfo,
        ilkData,
        proxyAddress,
        addGasEstimation,
        ilks,
      }) => {
        const allowance: Observable<undefined | BigNumber> =
          (proxyAddress && allowance$(token, account, proxyAddress)) || of(undefined)

        return combineLatestObject({
          context,
          txHelpers,
          token,
          account,
          priceInfo,
          balanceInfo,
          ilkData,
          proxyAddress,
          addGasEstimation,
          allowance,
          ilks,
        })
      },
    ),
  )
}

export function configureBorrowVaultInputs({
  connectedContext$,
  txHelpers$,
  priceInfo$,
  allowance$,
  balanceInfo$,
  ilkData$,
  proxyAddress$,
  proxyActionsAdapterResolver$,
  addGasEstimation$,
  ilkToToken$,
  ilks$,
  ilk,
}: ConfigureBorrowVaultInputs): Observable<BorrowVaultInputsReturn> {
  const vaultInputs$ = configureBaseVaultInputs({
    connectedContext$,
    txHelpers$,
    priceInfo$,
    balanceInfo$,
    ilkData$,
    proxyAddress$,
    allowance$,
    addGasEstimation$,
    ilkToToken$,
    ilks$,
    ilk,
  })

  return vaultInputs$.pipe(
    switchMap((inputs) => {
      return combineLatestObject({
        ...inputs,
        proxyActionsAdapter: proxyActionsAdapterResolver$({ ilk }),
      })
    }),
  )
}

export function configureMultiplyVaultInputs({
  connectedContext$,
  txHelpers$,
  priceInfo$,
  allowance$,
  balanceInfo$,
  ilkData$,
  proxyAddress$,
  slippageLimit$,
  addGasEstimation$,
  ilkToToken$,
  ilks$,
  ilk,
}: ConfigureMultiplyVaultInputs): Observable<MultiplyVaultInputsReturn> {
  const vaultInputs$ = configureBaseVaultInputs({
    connectedContext$,
    txHelpers$,
    priceInfo$,
    balanceInfo$,
    ilkData$,
    proxyAddress$,
    addGasEstimation$,
    allowance$,
    ilkToToken$,
    ilks$,
    ilk,
  })

  return vaultInputs$.pipe(
    switchMap((inputs) => {
      return combineLatestObject({ ...inputs, slippageLimit: slippageLimit$ })
    }),
  )
}

export function configureGuniVaultInputs({
  connectedContext$,
  txHelpers$,
  priceInfo$,
  allowance$,
  balanceInfo$,
  ilkData$,
  proxyAddress$,
  slippageLimit$,
  addGasEstimation$,
  ilkToToken$,
  ilks$,
  ilk,
}: ConfigureMultiplyVaultInputs) {
  const vaultInputs$ = configureBaseVaultInputs({
    connectedContext$,
    txHelpers$,
    priceInfo$,
    balanceInfo$,
    ilkData$,
    proxyAddress$,
    addGasEstimation$,
    allowance$,
    ilkToToken$,
    ilks$,
    ilk,
  })

  return vaultInputs$.pipe(
    switchMap((inputs) => {
      return combineLatestObject({ ...inputs, slippageLimit: slippageLimit$ })
    }),
  )
}
