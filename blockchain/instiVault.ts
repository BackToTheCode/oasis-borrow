import BigNumber from 'bignumber.js'
import { combineLatest, Observable, of } from 'rxjs'
import { filter, map, switchMap } from 'rxjs/operators'

import { Vault } from './vaults'

interface InstiVault extends Vault {
  originationFee: BigNumber
  activeCollRatio: BigNumber
  debtCeiling: BigNumber
}

export function createInstiVault$(
  vault$: (id: BigNumber) => Observable<Vault>,
  charterNib$: (args: { ilk: string; usr: string }) => Observable<BigNumber>,
  charterPeace$: (args: { ilk: string; usr: string }) => Observable<BigNumber>,
  charterUline$: (args: { ilk: string; usr: string }) => Observable<BigNumber>,
  id: BigNumber,
): Observable<InstiVault> {
  return vault$(id).pipe(
    switchMap((vault) =>
      of(vault).pipe(
        map((vault) => [vault.ilk, vault.controller] as const),
        filter((params): params is [string, string] => params[1] !== undefined),
        switchMap(([ilk, usr]) =>
          combineLatest(
            charterNib$({ ilk, usr }),
            charterPeace$({ ilk, usr }),
            charterUline$({ ilk, usr }),
          ).pipe(
            map(([nib, peace, uline]) => ({
              ...vault,
              originationFee: nib,
              activeCollRatio: peace,
              debtCeiling: uline,
            })),
          ),
        ),
      ),
    ),
  )
}