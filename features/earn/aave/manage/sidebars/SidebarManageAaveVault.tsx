import { useActor } from '@xstate/react'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'
import { Sender } from 'xstate'

import {
  getEstimatedGasFeeTextOld,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from '../../../../../components/vault/VaultChangesInformation'
import { formatCryptoBalance, formatFiatBalance } from '../../../../../helpers/formatters/format'
import { staticFilesRuntimeUrl } from '../../../../../helpers/staticPaths'
import { zero } from '../../../../../helpers/zero'
import { OpenVaultAnimation } from '../../../../../theme/animations'
import { AdjustRiskView } from '../../common/components/SidebarAdjustRiskView'
import { useManageAaveStateMachineContext } from '../containers/AaveManageStateMachineContext'
import { ManageAaveEvent, ManageAaveStateMachine, ManageAaveStateMachineState } from '../state'

export interface ManageAaveVaultProps {
  readonly aaveStateMachine: ManageAaveStateMachine
}

interface ManageAaveStateProps {
  readonly state: ManageAaveStateMachineState
  readonly send: Sender<ManageAaveEvent>
}

function TransactionInformationContainer({ state }: ManageAaveStateProps) {
  const { t } = useTranslation()
  return (
    <VaultChangesInformationContainer title="Total fees">
      <VaultChangesInformationItem
        label={t('transaction-fee')}
        value={getEstimatedGasFeeTextOld(state.context.estimatedGasPrice)}
      />
    </VaultChangesInformationContainer>
  )
}

function EthBalanceAfterClose({ state }: ManageAaveStateProps) {
  const { t } = useTranslation()
  const balance = formatCryptoBalance(state.context.balanceAfterClose || zero)
  const fiatBalanceAfterClose = (state.context.balanceAfterClose || zero).times(
    state.context.tokenPrice || zero,
  )
  const fiatBalance = formatFiatBalance(fiatBalanceAfterClose)
  return (
    <Flex sx={{ justifyContent: 'space-between' }}>
      <Text variant="boldParagraph3" sx={{ color: 'neutral80' }}>
        {t('manage-earn.aave.vault-form.eth-after-closing')}
      </Text>
      <Text variant="boldParagraph3">
        {balance} {state.context.token} (${fiatBalance})
      </Text>
    </Flex>
  )
}

function ManageAaveTransactionInProgressStateView({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <OpenVaultAnimation />
        <TransactionInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      isLoading: true,
      disabled: true,
      label: t('manage-earn.aave.vault-form.confirm-btn'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function ManageAaveReviewingStateView({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.close-title'),
    content: (
      <Grid gap={3}>
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          {t('manage-earn.aave.vault-form.close-description')}
        </Text>
        <EthBalanceAfterClose state={state} send={send} />
        <TransactionInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      isLoading: false,
      disabled: !state.can('START_TRANSACTION'),
      label: t('manage-earn.aave.vault-form.confirm-btn'),
      action: () => send('START_TRANSACTION'),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function ManageAaveFailureStateView({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.close-title'),
    content: (
      <Grid gap={3}>
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          {t('manage-earn.aave.vault-form.close-description')}
        </Text>
        <EthBalanceAfterClose state={state} send={send} />
        <TransactionInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      isLoading: false,
      disabled: false,
      label: t('manage-earn.aave.vault-form.retry-btn'),
      action: () => send({ type: 'RETRY' }),
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

function ManageAaveSuccessStateView({ state, send }: ManageAaveStateProps) {
  const { t } = useTranslation()

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('manage-earn.aave.vault-form.success-title'),
    content: (
      <Grid gap={3}>
        <Box>
          <Flex sx={{ justifyContent: 'center', mb: 4 }}>
            <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
          </Flex>
        </Box>
        <TransactionInformationContainer state={state} send={send} />
      </Grid>
    ),
    primaryButton: {
      label: t('manage-earn.aave.vault-form.go-to-position'),
      url: ``,
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}

export function SidebarManageAaveVault() {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state, send] = useActor(stateMachine)
  const { t } = useTranslation()

  switch (true) {
    case state.matches('editing'):
      return (
        <AdjustRiskView
          state={state}
          send={send}
          primaryButton={{
            isLoading: false,
            disabled: true,
            label: t('manage-earn.aave.vault-form.adjust-risk'),
            action: () => {
              send('ADJUST_POSITION')
            },
          }}
          textButton={{
            isLoading: false,
            disabled: false,
            label: t('manage-earn.aave.vault-form.close'),
            action: () => {
              send('CLOSE_POSITION')
            },
          }}
        />
      )
    case state.matches('reviewingClosing'):
      return <ManageAaveReviewingStateView state={state} send={send} />
    case state.matches('reviewingAdjusting'):
      return <ManageAaveReviewingStateView state={state} send={send} />
    case state.matches('txInProgress'):
      return <ManageAaveTransactionInProgressStateView state={state} send={send} />
    case state.matches('txFailure'):
      return <ManageAaveFailureStateView state={state} send={send} />
    case state.matches('txSuccess'):
      return <ManageAaveSuccessStateView state={state} send={send} />
    default: {
      return <></>
    }
  }
}
