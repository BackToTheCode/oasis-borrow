import BigNumber from 'bignumber.js'
import { IlkData } from 'apps/main/blockchain/ilks'
import { getToken } from 'apps/main/blockchain/tokensMetadata'
import { Vault } from 'apps/main/blockchain/vaults'
import { useAppContext } from 'apps/main/components/AppContextProvider'
import { PickCloseState, PickCloseStateProps } from 'apps/main/components/dumb/PickCloseState'
import { SliderValuePicker, SliderValuePickerProps } from 'apps/main/components/dumb/SliderValuePicker'
import { EstimationOnClose } from 'apps/main/components/EstimationOnClose'
import { SidebarResetButton } from 'apps/main/components/vault/sidebar/SidebarResetButton'
import { VaultErrors } from 'apps/main/components/vault/VaultErrors'
import { VaultWarnings } from 'apps/main/components/vault/VaultWarnings'
import { getOnCloseEstimations } from 'apps/main/features/automation/common/estimations/onCloseEstimations'
import { AddAutoTakeProfitInfoSection } from 'apps/main/features/automation/optimization/autoTakeProfit/controls/AddAutoTakeProfitInfoSection'
import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
} from 'apps/main/features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import {
  AutoTakeProfitTriggerData,
  prepareAutoTakeProfitResetData,
} from 'apps/main/features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { VaultErrorMessage } from 'apps/main/features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'apps/main/features/form/warningMessagesHandler'
import { formatAmount } from 'apps/main/helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface SidebarAutoTakeProfitEditingStageProps {
  autoTakeProfitState: AutoTakeProfitFormChange
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  closePickerConfig: PickCloseStateProps
  ethMarketPrice: BigNumber
  isEditing: boolean
  sliderConfig: SliderValuePickerProps
  tokenMarketPrice: BigNumber
  vault: Vault
  ilkData: IlkData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
}

export function SidebarAutoTakeProfitEditingStage({
  autoTakeProfitState,
  autoTakeProfitTriggerData,
  closePickerConfig,
  ethMarketPrice,
  isEditing,
  sliderConfig,
  tokenMarketPrice,
  vault,
  ilkData,
  errors,
  warnings,
}: SidebarAutoTakeProfitEditingStageProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()

  const { estimatedProfitOnClose } = getOnCloseEstimations({
    colMarketPrice: autoTakeProfitState.executionPrice,
    colOraclePrice: autoTakeProfitState.executionPrice,
    debt: vault.debt,
    debtOffset: vault.debtOffset,
    ethMarketPrice,
    lockedCollateral: vault.lockedCollateral,
    toCollateral: autoTakeProfitState.toCollateral,
  })
  const closeToToken = autoTakeProfitState.toCollateral ? vault.token : 'DAI'

  return (
    <>
      <PickCloseState {...closePickerConfig} />
      <SliderValuePicker {...sliderConfig} />
      {isEditing && (
        <>
          <VaultErrors errorMessages={errors} ilkData={ilkData} />
          <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
        </>
      )}
      <EstimationOnClose
        iconCircle={getToken(closeToToken).iconCircle}
        label={t('auto-take-profit.estimated-at-trigger', { token: closeToToken })}
        value={`${formatAmount(estimatedProfitOnClose, closeToToken)} ${closeToToken}`}
      />
      {isEditing && (
        <>
          <SidebarResetButton
            clear={() => {
              uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
                type: 'reset',
                resetData: prepareAutoTakeProfitResetData(
                  autoTakeProfitState,
                  autoTakeProfitTriggerData,
                ),
              })
            }}
          />
          <AutoTakeProfitInfoSectionControl
            debt={vault.debt}
            debtOffset={vault.debtOffset}
            ethMarketPrice={ethMarketPrice}
            lockedCollateral={vault.lockedCollateral}
            toCollateral={autoTakeProfitState.toCollateral}
            token={vault.token}
            tokenMarketPrice={tokenMarketPrice}
            triggerColPrice={autoTakeProfitState.executionPrice}
            triggerColRatio={autoTakeProfitState.executionCollRatio}
          />
        </>
      )}
    </>
  )
}

interface AutoTakeProfitInfoSectionControlProps {
  debt: BigNumber
  debtOffset: BigNumber
  ethMarketPrice: BigNumber
  lockedCollateral: BigNumber
  toCollateral: boolean
  token: string
  tokenMarketPrice: BigNumber
  triggerColPrice: BigNumber
  triggerColRatio: BigNumber
}

function AutoTakeProfitInfoSectionControl({
  debt,
  debtOffset,
  ethMarketPrice,
  lockedCollateral,
  toCollateral,
  token,
  triggerColPrice,
  triggerColRatio,
}: AutoTakeProfitInfoSectionControlProps) {
  const {
    estimatedGasFeeOnTrigger,
    estimatedOasisFeeOnTrigger,
    totalTriggerCost,
  } = getOnCloseEstimations({
    colMarketPrice: triggerColPrice,
    colOraclePrice: triggerColPrice,
    debt: debt,
    debtOffset: debtOffset,
    ethMarketPrice,
    lockedCollateral: lockedCollateral,
    toCollateral: toCollateral,
  })

  return (
    <AddAutoTakeProfitInfoSection
      debtRepaid={debt}
      estimatedOasisFeeOnTrigger={estimatedOasisFeeOnTrigger}
      estimatedGasFeeOnTrigger={estimatedGasFeeOnTrigger}
      token={token}
      totalTriggerCost={totalTriggerCost}
      triggerColPrice={triggerColPrice}
      triggerColRatio={triggerColRatio}
    />
  )
}
