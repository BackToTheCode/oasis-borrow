import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { BalanceInfo } from 'features/shared/balanceInfo'
import { PriceInfo } from 'features/shared/priceInfo'
import { UserSettingsState } from 'features/userSettings/userSettings'
import { combineLatest, iif, Observable, of, pipe, throwError } from 'rxjs'
import { switchMap } from 'rxjs/operators'

function validateIlks(ilk: string) {
  return pipe(
    switchMap(([ilks, ...rest]: [string[]]) =>
      iif(
        () => !ilks.some((i) => i === ilk),
        throwError(new Error(`Ilk ${ilk} does not exist`)),
        of([...rest]),
      ),
    ),
  )
}

export function createVaultInputs({
  context$,
  txHelpers$,
  priceInfo$,
  balanceInfo$,
  ilkData$,
  proxyAddress$,
  slippageLimit$,
  ilkToToken$,
  ilks$,
  ilk,
}: {
  context$: Observable<ContextConnected>
  txHelpers$: Observable<TxHelpers>
  priceInfo$: (token: string) => Observable<PriceInfo>
  balanceInfo$: (token: string, address: string | undefined) => Observable<BalanceInfo>
  ilkData$: (ilk: string) => Observable<IlkData>
  proxyAddress$: (address: string) => Observable<string | undefined>
  slippageLimit$?: Observable<UserSettingsState>
  ilkToToken$: Observable<(ilk: string) => string>
  ilks$: Observable<string[]>
  ilk: string
}): Observable<
  [
    [ContextConnected, TxHelpers, string, string, UserSettingsState],
    [PriceInfo, BalanceInfo, IlkData, string | undefined],
  ]
> {
  return combineLatest(ilks$, context$, ilkToToken$).pipe(
    validateIlks(ilk),
    switchMap(([context, ilkToToken]: [ContextConnected, (ilk: string) => string]) => {
      const account = context.account
      const token = ilkToToken(ilk)

      const vaultInputObservables: (
        | Observable<ContextConnected>
        | Observable<TxHelpers>
        | Observable<UserSettingsState>
        | Observable<string>
      )[] = [context$, txHelpers$, of(token), of(account)]
      if (slippageLimit$) vaultInputObservables.push(slippageLimit$)

      /*
        Combining observables in this way is
        Necessary to overcome combineLatest 6 arg limit
      */
      const inputs$ = combineLatest(...vaultInputObservables)
      const paramaterisedInputs$ = combineLatest(
        priceInfo$(token),
        balanceInfo$(token, account),
        ilkData$(ilk),
        proxyAddress$(account),
      )

      return combineLatest([inputs$, paramaterisedInputs$])
    }),
  )
}
