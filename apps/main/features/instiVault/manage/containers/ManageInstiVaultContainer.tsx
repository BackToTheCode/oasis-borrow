import { trackingEvents } from 'apps/main/analytics/analytics'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import { DefaultVaultHeader } from 'apps/main/components/vault/DefaultVaultHeader'
import {
  EstimationError,
  getEstimatedGasFeeTextOld,
  VaultChangesInformationItem,
} from 'apps/main/components/vault/VaultChangesInformation'
import { VaultIlkDetailsItem } from 'apps/main/components/vault/VaultHeader'
import { ManageVaultForm } from 'apps/main/features/borrow/manage/containers/ManageVaultForm'
import { createManageVaultAnalytics$ } from 'apps/main/features/borrow/manage/pipes/manageVaultAnalytics'
import { VaultHistoryView } from 'apps/main/features/vaultHistory/VaultHistoryView'
import { formatAmount, formatPercent } from 'apps/main/helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Box, Flex, Grid } from 'theme-ui'

import { ChevronUpDown } from '../../../../components/ChevronUpDown'
import { useFeatureToggle } from '../../../../helpers/useFeatureToggle'
import { ManageInstiVaultState } from '../../../borrow/manage/pipes/adapters/institutionalBorrowManageAdapter'
import { ManageInstiVaultDetails } from './ManageInstiVaultDetails'

export function ManageInstiVaultContainer({ manageVault }: { manageVault: ManageInstiVaultState }) {
  const { manageVault$, context$ } = useAppContext()
  const {
    vault: { id, originationFeePercent, ilk, token },
    clear,
    ilkData,
    transactionFeeETH,
    originationFeeUSD,
    priceInfo,
  } = manageVault

  const { t } = useTranslation()
  const [showFees, setShowFees] = useState(false)
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')

  useEffect(() => {
    const subscription = createManageVaultAnalytics$(
      manageVault$(id),
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      clear()
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      {!stopLossReadEnabled && (
        <DefaultVaultHeader
          header={t('vault.insti-header', { ilk, id })}
          ilkData={ilkData}
          id={id}
          token={token}
          priceInfo={priceInfo}
        >
          <VaultIlkDetailsItem
            label={t('manage-insti-vault.origination-fee')}
            value={`${formatPercent(originationFeePercent.times(100), { precision: 2 })}`}
            tooltipContent={t('manage-insti-vault.tooltip.origination-fee')}
            styles={{
              tooltip: {
                left: ['-80px', 'auto'],
                right: ['auto', '-32px'],
              },
            }}
          />
        </DefaultVaultHeader>
      )}
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          <ManageInstiVaultDetails {...manageVault} />
          {!stopLossReadEnabled && <VaultHistoryView vaultHistory={manageVault.vaultHistory} />}
        </Grid>
        <Box>
          <ManageVaultForm
            hideMultiplyTab={true}
            txnCostDisplay={
              <>
                <VaultChangesInformationItem
                  label={t('transaction-fee')}
                  value={
                    <Flex onClick={() => setShowFees((showFees) => !showFees)}>
                      {transactionFeeETH && !transactionFeeETH.isNaN() ? (
                        `${formatAmount(transactionFeeETH, 'ETH')} ETH`
                      ) : (
                        <EstimationError withBrackets={false} />
                      )}
                      <ChevronUpDown isUp={showFees} size="auto" width="12px" sx={{ ml: 2 }} />
                    </Flex>
                  }
                />
                {showFees && (
                  <Grid pl={3} gap={2}>
                    <VaultChangesInformationItem
                      label={t('manage-insti-vault.origination-fee')}
                      value={
                        <Flex>
                          {originationFeeUSD
                            ? `$${formatAmount(originationFeeUSD, 'USD')}`
                            : '$ -- '}
                        </Flex>
                      }
                    />
                    <VaultChangesInformationItem
                      label={t('vault-changes.oasis-fee')}
                      value={<Flex>$0.00</Flex>}
                    />
                    <VaultChangesInformationItem
                      label={'Estimated gas fee'}
                      value={getEstimatedGasFeeTextOld(manageVault)}
                    />
                  </Grid>
                )}
              </>
            }
            {...manageVault}
          />
        </Box>
      </Grid>
    </>
  )
}
