import { ManageMultiplyVaultButton } from 'apps/main/components/vault/commonMultiply/ManageMultiplyVaultButton'
import {
  ManageMultiplyVaultConfirmation,
  ManageMultiplyVaultConfirmationStatus,
} from 'apps/main/components/vault/commonMultiply/ManageMultiplyVaultConfirmation'
import { ManageVaultCollateralAllowance } from 'apps/main/components/vault/commonMultiply/ManageVaultCollateralAllowance'
import { ManageVaultDaiAllowance } from 'apps/main/components/vault/commonMultiply/ManageVaultDaiAllowance'
import { VaultAllowanceStatus } from 'apps/main/components/vault/VaultAllowance'
import { VaultChangesWithADelayCard } from 'apps/main/components/vault/VaultChangesWithADelayCard'
import { VaultErrors } from 'apps/main/components/vault/VaultErrors'
import { VaultFormContainer } from 'apps/main/components/vault/VaultFormContainer'
import { VaultProxyContentBox, VaultProxyStatusCard } from 'apps/main/components/vault/VaultProxy'
import { VaultWarnings } from 'apps/main/components/vault/VaultWarnings'
import { StopLossTriggeredFormControl } from 'apps/main/features/automation/protection/stopLoss/controls/StopLossTriggeredFormControl'
import { extractGasDataFromState } from 'apps/main/helpers/extractGasDataFromState'
import { useFeatureToggle } from 'apps/main/helpers/useFeatureToggle'
import React, { useState } from 'react'

import { ManageMultiplyVaultState } from '../pipes/manageMultiplyVault'
import { ManageMultiplyVaultBorrowTransition } from './ManageMultiplyVaultBorrowTransition'
import { ManageMultiplyVaultChangesInformation } from './ManageMultiplyVaultChangesInformation'
import { ManageMultiplyVaultEditing } from './ManageMultiplyVaultEditing'
import { ManageMultiplyVaultFormHeader } from './ManageMultiplyVaultFormHeader'

export function ManageMultiplyVaultForm(props: ManageMultiplyVaultState) {
  const {
    isEditingStage,
    isProxyStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isManageStage,
    isBorrowTransitionStage,
    accountIsConnected,
    accountIsController,
    daiAllowanceTxHash,
    collateralAllowanceTxHash,
    vault: { token },
    stage,
    otherAction,
    vaultHistory,
    stopLossTriggered,
    toggle,
  } = props

  const [reopenPositionClicked, setReopenPositionClicked] = useState(false)
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')
  const shouldDisplayActionButton =
    accountIsConnected &&
    (accountIsController ||
      (!accountIsController &&
        stage !== 'adjustPosition' &&
        (otherAction === 'depositCollateral' || otherAction === 'paybackDai')))

  const gasData = extractGasDataFromState(props)
  const mostRecentEvent = vaultHistory[0]

  const isVaultClosed =
    mostRecentEvent?.kind === 'CLOSE_VAULT_TO_DAI' ||
    mostRecentEvent?.kind === 'CLOSE_VAULT_TO_COLLATERAL'

  return (
    <VaultFormContainer toggleTitle="Edit Vault">
      {stopLossTriggered && !reopenPositionClicked && stopLossReadEnabled && isVaultClosed ? (
        <StopLossTriggeredFormControl
          closeEvent={mostRecentEvent}
          onClick={() => {
            setReopenPositionClicked(true)
            toggle && toggle('otherActions')
          }}
        />
      ) : (
        <>
          <ManageMultiplyVaultFormHeader {...props} />
          {isProxyStage && <VaultProxyContentBox stage={stage} gasData={gasData} />}
          {isEditingStage && <ManageMultiplyVaultEditing {...props} />}
          {isCollateralAllowanceStage && <ManageVaultCollateralAllowance {...props} />}
          {isDaiAllowanceStage && <ManageVaultDaiAllowance {...props} />}
          {isManageStage && (
            <ManageMultiplyVaultConfirmation {...props}>
              {(state) => <ManageMultiplyVaultChangesInformation {...state} />}
            </ManageMultiplyVaultConfirmation>
          )}
          {isBorrowTransitionStage && <ManageMultiplyVaultBorrowTransition {...props} />}
          {shouldDisplayActionButton && (
            <>
              <VaultErrors {...props} />
              <VaultWarnings {...props} />
              {stage === 'manageSuccess' && <VaultChangesWithADelayCard />}
              <ManageMultiplyVaultButton {...props} />
            </>
          )}
          {isProxyStage && <VaultProxyStatusCard {...props} />}
          {isCollateralAllowanceStage && (
            <VaultAllowanceStatus
              {...props}
              allowanceTxHash={collateralAllowanceTxHash}
              token={token}
            />
          )}
          {isDaiAllowanceStage && (
            <VaultAllowanceStatus {...props} allowanceTxHash={daiAllowanceTxHash} token={'DAI'} />
          )}
          {isManageStage && <ManageMultiplyVaultConfirmationStatus {...props} />}
        </>
      )}
    </VaultFormContainer>
  )
}
