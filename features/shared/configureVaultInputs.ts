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
  addGasEstimation: AddGasEstimationFunction
  proxyAddress: string | undefined
  proxyActionsAdapter: ProxyActionsSmartContractAdapterInterface
}

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
}: {
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
}): Observable<BaseVaultInputsReturn> {
  return combineLatestObject({ context: connectedContext$, ilkToToken: ilkToToken$ }).pipe(
    switchMap(
      ({
        context,
        ilkToToken,
      }: {
        context: ContextConnected
        ilkToToken: (ilk: string) => string
      }) => {
        const account = context.account
        const token = ilkToToken(ilk)

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
      },
    ),
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
}: {
  connectedContext$: Observable<ContextConnected>
  txHelpers$: Observable<TxHelpers>
  priceInfo$: (token: string) => Observable<PriceInfo>
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>
  balanceInfo$: (token: string, address: string | undefined) => Observable<BalanceInfo>
  ilkData$: (ilk: string) => Observable<IlkData>
  proxyAddress$: (address: string) => Observable<string | undefined>
  addGasEstimation$: AddGasEstimationFunction
  proxyActionsAdapterResolver$: ({
    ilk,
  }: {
    ilk: string
  }) => Observable<ProxyActionsSmartContractAdapterInterface>
  ilkToToken$: (ilk: string) => Observable<string>
  ilks$: Observable<string[]>
  ilk: string
}): Observable<
  BaseVaultInputsReturn & { proxyActionsAdapter: ProxyActionsSmartContractAdapterInterface }
> {
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
}: {
  connectedContext$: Observable<ContextConnected>
  txHelpers$: Observable<TxHelpers>
  priceInfo$: (token: string) => Observable<PriceInfo>
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>
  balanceInfo$: (token: string, address: string | undefined) => Observable<BalanceInfo>
  ilkData$: (ilk: string) => Observable<IlkData>
  proxyAddress$: (address: string) => Observable<string | undefined>
  addGasEstimation$: AddGasEstimationFunction
  slippageLimit$: Observable<UserSettingsState>
  ilkToToken$: (ilk: string) => Observable<string>
  ilks$: Observable<string[]>
  ilk: string
}): Observable<BaseVaultInputsReturn & { slippageLimit: UserSettingsState }> {
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
