import {
  extractFieldDepositCollateralData,
  extractFieldGenerateDaiData,
  FieldDepositCollateral,
  FieldGenerateDai,
} from 'apps/main/components/vault/sidebar/SidebarFields'
import { SidebarResetButton } from 'apps/main/components/vault/sidebar/SidebarResetButton'
import { VaultErrors } from 'apps/main/components/vault/VaultErrors'
import { VaultWarnings } from 'apps/main/components/vault/VaultWarnings'
import { OpenVaultChangesInformation } from 'apps/main/features/borrow/open/containers/OpenVaultChangesInformation'
import { OpenVaultState } from 'apps/main/features/borrow/open/pipes/openVault'
import { extractCommonErrors, extractCommonWarnings } from 'apps/main/helpers/messageMappers'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

export function SidebarOpenBorrowVaultEditingStage(props: OpenVaultState) {
  const {
    clear,
    depositAmount,
    errorMessages,
    inputAmountsEmpty,
    showGenerateOption,
    toggleGenerateOption,
    token,
    warningMessages,
  } = props

  const [isSecondaryFieldDisabled, setIsSecondaryFieldDisabled] = useState<boolean>(true)

  useEffect(() => {
    if (inputAmountsEmpty) {
      setIsSecondaryFieldDisabled(true)
    } else {
      if (!showGenerateOption) toggleGenerateOption!()
      setIsSecondaryFieldDisabled(false)
    }
  }, [depositAmount])

  return (
    <Grid gap={3}>
      <FieldDepositCollateral token={token} {...extractFieldDepositCollateralData(props)} />
      <FieldGenerateDai
        disabled={isSecondaryFieldDisabled}
        {...extractFieldGenerateDaiData(props)}
      />
      {!inputAmountsEmpty && <SidebarResetButton clear={clear} />}
      <VaultErrors {...props} errorMessages={extractCommonErrors(errorMessages)} />
      <VaultWarnings {...props} warningMessages={extractCommonWarnings(warningMessages)} />
      <OpenVaultChangesInformation {...props} />
    </Grid>
  )
}
