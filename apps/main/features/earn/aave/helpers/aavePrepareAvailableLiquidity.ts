import BigNumber from 'bignumber.js'
import { AaveReserveDataReply } from 'apps/main/blockchain/calls/aave/aaveProtocolDataProvider'
import { TokenSymbolType } from 'apps/main/blockchain/tokensMetadata'
import { amountFromWei } from 'apps/main/blockchain/utils'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export type PreparedAaveReserveData = BigNumber

type PrepareAaveAvailableLiquidityProps = [AaveReserveDataReply, BigNumber[]]

export function prepareAaveAvailableLiquidityInUSD$(
  token: TokenSymbolType,
): (
  getAaveReserveData$: Observable<AaveReserveDataReply>,
  getAaveAssetsPrices$: Observable<string[]>,
) => Observable<PreparedAaveReserveData> {
  return (getAaveReserveData$, getAaveAssetsPrices$) =>
    combineLatest(getAaveReserveData$, getAaveAssetsPrices$).pipe(
      map(([reserveData, [USDC_ETH_price]]: PrepareAaveAvailableLiquidityProps) => {
        const availableLiquidityInETH = amountFromWei(
          new BigNumber(reserveData.availableLiquidity),
          token,
        )
        const ETH_USDC_price = new BigNumber(1).div(USDC_ETH_price) // price of one ETH in USDC
        return availableLiquidityInETH.times(ETH_USDC_price)
      }),
    )
}
