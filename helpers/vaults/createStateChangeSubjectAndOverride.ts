import { MutableOpenVaultState, OpenVaultChange } from 'features/borrow/open/pipes/openVault'
import { Subject } from 'rxjs'

export function createStateChangeSubjectAndOverride() {
  const change$ = new Subject<OpenVaultChange>()

  function change(ch: OpenVaultChange) {
    change$.next(ch)
  }

  // NOTE: Not to be used in production/dev, test only
  function injectStateOverride(stateToOverride: Partial<MutableOpenVaultState>) {
    return change$.next({ kind: 'injectStateOverride', stateToOverride })
  }

  return {
    change$,
    change,
    injectStateOverride,
  }
}
