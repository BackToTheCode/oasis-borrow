import { getToken } from 'apps/main/blockchain/tokensMetadata'
import { Radio } from 'apps/main/components/forms/Radio'
import { TxStatusCardProgress, TxStatusCardSuccess } from 'apps/main/components/vault/TxStatusCard'
import { OpenVaultState } from 'apps/main/features/borrow/open/pipes/openVault'
import { OpenGuniVaultState } from 'apps/main/features/earn/guni/open/pipes/openGuniVault'
import { OpenMultiplyVaultState } from 'apps/main/features/multiply/open/pipes/openMultiplyVault'
import { BigNumberInput } from 'apps/main/helpers/BigNumberInput'
import { formatAmount, formatCryptoBalance } from 'apps/main/helpers/formatters/format'
import { handleNumericInput } from 'apps/main/helpers/input'
import { CommonVaultState } from 'apps/main/helpers/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { createNumberMask } from 'text-mask-addons'
import { Grid, Text } from 'theme-ui'

export function VaultAllowance({
  stage,
  token,
  depositAmount,
  allowanceAmount,
  updateAllowanceAmount,
  setAllowanceAmountUnlimited,
  setAllowanceAmountToDepositAmount,
  setAllowanceAmountCustom,
  selectedAllowanceRadio,
}: OpenVaultState | OpenMultiplyVaultState | OpenGuniVaultState) {
  const canSelectRadio = stage === 'allowanceWaitingForConfirmation'

  const isUnlimited = selectedAllowanceRadio === 'unlimited'
  const isDeposit = selectedAllowanceRadio === 'depositAmount'
  const isCustom = selectedAllowanceRadio === 'custom'
  const { t } = useTranslation()

  return (
    <Grid>
      {canSelectRadio && (
        <>
          <Radio
            onChange={setAllowanceAmountUnlimited!}
            name="allowance-open-form"
            checked={isUnlimited}
          >
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
              {t('unlimited-allowance')}
            </Text>
          </Radio>
          <Radio
            onChange={setAllowanceAmountToDepositAmount}
            name="allowance-open-form"
            checked={isDeposit}
          >
            <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: '18px' }}>
              {t('token-depositing', { token, amount: formatCryptoBalance(depositAmount!) })}
            </Text>
          </Radio>
          <Radio onChange={setAllowanceAmountCustom} name="allowance-open-form" checked={isCustom}>
            <Grid columns="2fr 2fr 1fr" sx={{ alignItems: 'center', my: 2 }}>
              <Text variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
                {t('custom')}
              </Text>
              <BigNumberInput
                sx={{
                  p: 1,
                  borderRadius: 'small',
                  borderColor: 'secondary100',
                  width: '100px',
                  fontSize: 1,
                  px: 3,
                  py: '12px',
                }}
                disabled={!isCustom}
                value={
                  allowanceAmount && isCustom
                    ? formatAmount(allowanceAmount, getToken(token).symbol)
                    : undefined
                }
                mask={createNumberMask({
                  allowDecimal: true,
                  decimalLimit: getToken(token).digits,
                  prefix: '',
                })}
                onChange={handleNumericInput(updateAllowanceAmount!)}
              />
              <Text sx={{ fontSize: 1 }}>{token}</Text>
            </Grid>
          </Radio>
        </>
      )}
    </Grid>
  )
}

export function VaultAllowanceStatus({
  stage,
  allowanceTxHash,
  etherscan,
  token,
}: CommonVaultState & { allowanceTxHash?: string; token: string }) {
  const { t } = useTranslation()

  if (
    stage === 'allowanceInProgress' ||
    stage === 'daiAllowanceInProgress' ||
    stage === 'collateralAllowanceInProgress'
  ) {
    return (
      <TxStatusCardProgress
        text={t('setting-allowance-for', { token })}
        etherscan={etherscan!}
        txHash={allowanceTxHash!}
      />
    )
  }

  if (
    stage === 'allowanceSuccess' ||
    stage === 'daiAllowanceSuccess' ||
    stage === 'collateralAllowanceSuccess'
  ) {
    return (
      <TxStatusCardSuccess
        text={t('setting-allowance-for', { token })}
        etherscan={etherscan!}
        txHash={allowanceTxHash!}
      />
    )
  }
  return null
}