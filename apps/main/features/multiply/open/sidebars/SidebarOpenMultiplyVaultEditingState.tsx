import BigNumber from 'bignumber.js'
import {
  extractFieldDepositCollateralData,
  FieldDepositCollateral,
} from 'apps/main/components/vault/sidebar/SidebarFields'
import { SidebarResetButton } from 'apps/main/components/vault/sidebar/SidebarResetButton'
import { SidebarSliderAdjustMultiply } from 'apps/main/components/vault/sidebar/SidebarSliders'
import { VaultErrors } from 'apps/main/components/vault/VaultErrors'
import { VaultWarnings } from 'apps/main/components/vault/VaultWarnings'
import { OpenMultiplyVaultChangesInformation } from 'apps/main/features/multiply/open/containers/OpenMultiplyVaultChangesInformation'
import { OpenMultiplyVaultState } from 'apps/main/features/multiply/open/pipes/openMultiplyVault'
import { extractCommonErrors, extractCommonWarnings } from 'apps/main/helpers/messageMappers'
import React from 'react'
import { Grid } from 'theme-ui'

export function SidebarOpenMultiplyVaultEditingState(props: OpenMultiplyVaultState) {
  const {
    canAdjustRisk,
    clear,
    errorMessages,
    ilkData: { liquidationRatio },
    inputAmountsEmpty,
    maxCollRatio,
    requiredCollRatio,
    token,
    updateRequiredCollRatio,
    warningMessages,
  } = props

  return (
    <Grid gap={3}>
      <FieldDepositCollateral token={token} {...extractFieldDepositCollateralData(props)} />
      <SidebarSliderAdjustMultiply
        state={props}
        min={liquidationRatio}
        max={maxCollRatio}
        value={canAdjustRisk && requiredCollRatio ? requiredCollRatio : new BigNumber(100)}
        onChange={(e) => {
          updateRequiredCollRatio && updateRequiredCollRatio(new BigNumber(e.target.value))
        }}
      />
      {!inputAmountsEmpty && <SidebarResetButton clear={clear} />}
      <VaultErrors {...props} errorMessages={extractCommonErrors(errorMessages)} />
      <VaultWarnings {...props} warningMessages={extractCommonWarnings(warningMessages)} />
      <OpenMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
