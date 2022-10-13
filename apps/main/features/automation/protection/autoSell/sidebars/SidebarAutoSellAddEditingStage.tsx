import { BigNumber } from 'bignumber.js'
import { IlkData } from 'apps/main/blockchain/ilks'
import { collateralPriceAtRatio } from 'apps/main/blockchain/vault.maths'
import { Vault } from 'apps/main/blockchain/vaults'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import { AppLink } from 'apps/main/components/Links'
import { VaultViewMode } from 'apps/main/components/vault/GeneralManageTabBar'
import { MultipleRangeSlider } from 'apps/main/components/vault/MultipleRangeSlider'
import { SidebarResetButton } from 'apps/main/components/vault/sidebar/SidebarResetButton'
import { SidebarFormInfo } from 'apps/main/components/vault/SidebarFormInfo'
import { VaultActionInput } from 'apps/main/components/vault/VaultActionInput'
import { VaultErrors } from 'apps/main/components/vault/VaultErrors'
import { VaultWarnings } from 'apps/main/components/vault/VaultWarnings'
import { MIX_MAX_COL_RATIO_TRIGGER_OFFSET } from 'apps/main/features/automation/common/consts'
import {
  adjustDefaultValuesIfOutsideSlider,
  prepareAutoBSResetData,
} from 'apps/main/features/automation/common/helpers'
import { MaxGasPriceSection } from 'apps/main/features/automation/common/sidebars/MaxGasPriceSection'
import {
  AUTO_SELL_FORM_CHANGE,
  AutoBSFormChange,
} from 'apps/main/features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'apps/main/features/automation/common/state/autoBSTriggerData'
import { AUTOMATION_CHANGE_FEATURE } from 'apps/main/features/automation/common/state/automationFeatureChange'
import { AutomationFeatures } from 'apps/main/features/automation/common/types'
import { AddAutoSellInfoSection } from 'apps/main/features/automation/protection/autoSell/controls/AddAutoSellInfoSection'
import { StopLossTriggerData } from 'apps/main/features/automation/protection/stopLoss/state/stopLossTriggerData'
import { VaultErrorMessage } from 'apps/main/features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'apps/main/features/form/warningMessagesHandler'
import { TAB_CHANGE_SUBJECT } from 'apps/main/features/generalManageVault/TabChange'
import { handleNumericInput } from 'apps/main/helpers/input'
import { useFeatureToggle } from 'apps/main/helpers/useFeatureToggle'
import { useHash } from 'apps/main/helpers/useHash'
import { one } from 'apps/main/helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Text } from 'theme-ui'

interface AutoSellInfoSectionControlProps {
  vault: Vault
  autoSellState: AutoBSFormChange
  debtDelta: BigNumber
  collateralDelta: BigNumber
  executionPrice: BigNumber
}

function AutoSellInfoSectionControl({
  vault,
  autoSellState,
  debtDelta,
  collateralDelta,
  executionPrice,
}: AutoSellInfoSectionControlProps) {
  const deviationPercent = autoSellState.deviation.div(100)

  const targetRatioWithDeviationFloor = one
    .minus(deviationPercent)
    .times(autoSellState.targetCollRatio)
  const targetRatioWithDeviationCeiling = one
    .plus(deviationPercent)
    .times(autoSellState.targetCollRatio)

  return (
    <AddAutoSellInfoSection
      targetCollRatio={autoSellState.targetCollRatio}
      multipleAfterSell={one.div(autoSellState.targetCollRatio.div(100).minus(one)).plus(one)}
      execCollRatio={autoSellState.execCollRatio}
      nextSellPrice={executionPrice}
      collateralAfterNextSell={{
        value: vault.lockedCollateral,
        secondaryValue: vault.lockedCollateral.plus(collateralDelta),
      }}
      outstandingDebtAfterSell={{
        value: vault.debt,
        secondaryValue: vault.debt.plus(debtDelta),
      }}
      ethToBeSoldAtNextSell={collateralDelta.abs()}
      token={vault.token}
      targetRatioWithDeviationCeiling={targetRatioWithDeviationCeiling}
      targetRatioWithDeviationFloor={targetRatioWithDeviationFloor}
    />
  )
}

interface SidebarAutoSellAddEditingStageProps {
  vault: Vault
  ilkData: IlkData
  isEditing: boolean
  autoSellState: AutoBSFormChange
  autoSellTriggerData: AutoBSTriggerData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  debtDelta: BigNumber
  collateralDelta: BigNumber
  sliderMin: BigNumber
  sliderMax: BigNumber
  stopLossTriggerData: StopLossTriggerData
}

export function SidebarAutoSellAddEditingStage({
  vault,
  ilkData,
  isEditing,
  autoSellState,
  autoSellTriggerData,
  errors,
  warnings,
  debtDelta,
  collateralDelta,
  sliderMin,
  sliderMax,
  stopLossTriggerData,
}: SidebarAutoSellAddEditingStageProps) {
  const { uiChanges } = useAppContext()
  const { t } = useTranslation()
  const [, setHash] = useHash()
  const executionPrice = collateralPriceAtRatio({
    colRatio: autoSellState.execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })
  const readOnlyAutoBSEnabled = useFeatureToggle('ReadOnlyBasicBS')
  const isVaultEmpty = vault.debt.isZero()

  const { isStopLossEnabled, stopLossLevel } = stopLossTriggerData

  useEffect(() => {
    adjustDefaultValuesIfOutsideSlider({
      autoBSState: autoSellState,
      sliderMax,
      sliderMin,
      uiChanges,
      publishType: AUTO_SELL_FORM_CHANGE,
    })
  }, [vault.collateralizationRatio.toNumber()])

  const isCurrentCollRatioHigherThanSliderMax = vault.collateralizationRatio
    .times(100)
    .gt(sliderMax)

  if (
    isStopLossEnabled &&
    stopLossLevel.times(100).plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.times(2)).gt(sliderMax)
  ) {
    return (
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        <Trans
          i18nKey="auto-sell.sl-too-high"
          components={[
            <Text
              as="span"
              sx={{ fontWeight: 'semiBold', color: 'interactive100', cursor: 'pointer' }}
              onClick={() => {
                uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
                  type: 'Protection',
                  currentProtectionFeature: AutomationFeatures.STOP_LOSS,
                })
                setHash(VaultViewMode.Protection)
              }}
            />,
          ]}
          values={{
            maxStopLoss: sliderMax.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.times(2)),
          }}
        />
      </Text>
    )
  }

  if (isCurrentCollRatioHigherThanSliderMax) {
    return (
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        <Trans
          i18nKey="auto-sell.coll-ratio-too-high"
          components={[
            <Text
              as="span"
              sx={{ fontWeight: 'semiBold', color: 'interactive100', cursor: 'pointer' }}
              onClick={() => {
                uiChanges.publish(TAB_CHANGE_SUBJECT, {
                  type: 'change-tab',
                  currentMode: VaultViewMode.Overview,
                })
                setHash(VaultViewMode.Overview)
              }}
            />,
          ]}
          values={{
            maxAutoBuyCollRatio: sliderMax.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.times(2)),
          }}
        />
      </Text>
    )
  }

  if (readOnlyAutoBSEnabled && !isVaultEmpty) {
    return (
      <SidebarFormInfo
        title={t('auto-sell.adding-new-triggers-disabled')}
        description={t('auto-sell.adding-new-triggers-disabled-description')}
      />
    )
  }

  if (isVaultEmpty && autoSellTriggerData.isTriggerEnabled) {
    return (
      <SidebarFormInfo
        title={t('auto-sell.closed-vault-existing-trigger-header')}
        description={t('auto-sell.closed-vault-existing-trigger-description')}
      />
    )
  }

  if (isVaultEmpty) {
    return (
      <SidebarFormInfo
        title={t('auto-sell.closed-vault-not-existing-trigger-header')}
        description={t('auto-sell.closed-vault-not-existing-trigger-description')}
      />
    )
  }

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {autoSellState.maxBuyOrMinSellPrice !== undefined
          ? t('auto-sell.set-trigger-description', {
              targetCollRatio: autoSellState.targetCollRatio.toNumber(),
              token: vault.token,
              execCollRatio: autoSellState.execCollRatio,
              executionPrice: executionPrice.toFixed(2),
              minSellPrice: autoSellState.maxBuyOrMinSellPrice,
            })
          : t('auto-sell.set-trigger-description-no-threshold', {
              targetCollRatio: autoSellState.targetCollRatio.toNumber(),
              token: vault.token,
              execCollRatio: autoSellState.execCollRatio,
              executionPrice: executionPrice.toFixed(2),
            })}{' '}
        <AppLink
          href="https://kb.oasis.app/help/setting-up-auto-sell-for-your-vault"
          sx={{ fontSize: 2 }}
        >
          {t('here')}.
        </AppLink>
      </Text>{' '}
      <MultipleRangeSlider
        min={sliderMin.toNumber()}
        max={sliderMax.toNumber()}
        onChange={(value) => {
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'execution-coll-ratio',
            execCollRatio: new BigNumber(value.value0),
          })
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'target-coll-ratio',
            targetCollRatio: new BigNumber(value.value1),
          })
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
        }}
        value={{
          value0: autoSellState.execCollRatio.toNumber(),
          value1: autoSellState.targetCollRatio.toNumber(),
        }}
        valueColors={{
          value0: 'warning100',
          value1: 'primary100',
        }}
        step={1}
        leftDescription={t('auto-sell.sell-trigger-ratio')}
        rightDescription={t('auto-sell.target-coll-ratio')}
        leftThumbColor="warning100"
        rightThumbColor="primary100"
      />
      <VaultActionInput
        action={t('auto-sell.set-min-sell-price')}
        amount={autoSellState.maxBuyOrMinSellPrice}
        hasAuxiliary={false}
        hasError={false}
        currencyCode="USD"
        onChange={handleNumericInput((maxBuyOrMinSellPrice) => {
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'max-buy-or-sell-price',
            maxBuyOrMinSellPrice,
          })
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
        })}
        onToggle={(toggleStatus) => {
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'with-threshold',
            withThreshold: toggleStatus,
          })
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'max-buy-or-sell-price',
            maxBuyOrMinSellPrice: !toggleStatus
              ? undefined
              : autoSellTriggerData.maxBuyOrMinSellPrice,
          })
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
        }}
        defaultToggle={autoSellState.withThreshold}
        showToggle={true}
        toggleOnLabel={t('protection.set-no-threshold')}
        toggleOffLabel={t('protection.set-threshold')}
        toggleOffPlaceholder={t('protection.no-threshold')}
      />
      {isEditing && (
        <>
          <VaultErrors errorMessages={errors} ilkData={ilkData} autoType="Auto-Sell" />
          <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
        </>
      )}
      <MaxGasPriceSection
        onChange={(maxBaseFeeInGwei) => {
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'max-gas-fee-in-gwei',
            maxBaseFeeInGwei: new BigNumber(maxBaseFeeInGwei),
          })
          uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
            type: 'is-editing',
            isEditing: true,
          })
        }}
        value={autoSellState.maxBaseFeeInGwei.toNumber()}
      />
      {isEditing && (
        <>
          <SidebarResetButton
            clear={() => {
              uiChanges.publish(AUTO_SELL_FORM_CHANGE, {
                type: 'reset',
                resetData: prepareAutoBSResetData(
                  autoSellTriggerData,
                  vault.collateralizationRatio,
                  AUTO_SELL_FORM_CHANGE,
                ),
              })
            }}
          />
          <AutoSellInfoSectionControl
            autoSellState={autoSellState}
            vault={vault}
            debtDelta={debtDelta}
            collateralDelta={collateralDelta}
            executionPrice={executionPrice}
          />
        </>
      )}
    </>
  )
}
