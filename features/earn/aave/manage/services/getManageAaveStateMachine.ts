import { RiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { assign, sendParent, spawn } from 'xstate'

import { OperationExecutorTxMeta } from '../../../../../blockchain/calls/operationExecutor'
import { TxMetaKind } from '../../../../../blockchain/calls/txMeta'
import { TransactionStateMachine } from '../../../../stateMachines/transaction'
import {
  ClosePositionParametersStateMachine,
  createManageAaveStateMachine,
  ManageAaveContext,
  ManageAaveEvent,
  ManageAaveStateMachine,
  ManageAaveStateMachineServices,
} from '../state'

function contextToTransactionParameters(context: ManageAaveContext): OperationExecutorTxMeta {
  return {
    kind: TxMetaKind.operationExecutor,
    calls: context.transactionParameters!.calls as any,
    operationName: 'CustomOperation',
    token: context.token,
    proxyAddress: context.proxyAddress!,
  }
}

export function getManageAaveStateMachine$(
  services: ManageAaveStateMachineServices,
  closePositionParametersStateMachine$: Observable<ClosePositionParametersStateMachine>,
  transactionStateMachine: TransactionStateMachine<OperationExecutorTxMeta>,
  { token, address, strategy }: { token: string; address: string; strategy: string },
): Observable<ManageAaveStateMachine> {
  return closePositionParametersStateMachine$.pipe(
    map((closePositionParametersStateMachine) => {
      return createManageAaveStateMachine
        .withConfig({
          services: {
            ...services,
          },
          actions: {
            spawnClosePositionParametersMachine: assign((context) => ({
              refClosePositionParametersStateMachine: spawn(
                closePositionParametersStateMachine
                  .withConfig({
                    actions: {
                      notifyParent: sendParent(
                        (context): ManageAaveEvent => {
                          return {
                            type: 'CLOSING_PARAMETERS_RECEIVED',
                            parameters: context.transactionParameters!,
                            estimatedGasPrice: context.gasPriceEstimation!,
                          }
                        },
                      ),
                    },
                  })
                  .withContext({
                    ...closePositionParametersStateMachine.context,
                    proxyAddress: context.proxyAddress!,
                    token: context.strategy!,
                    position: context.protocolData!.position,
                  }),
                { name: 'parametersMachine' },
              ),
            })),
            spawnTransactionMachine: assign((context) => ({
              refTransactionStateMachine: spawn(
                transactionStateMachine
                  .withConfig({
                    actions: {
                      notifyParent: sendParent(
                        (_): ManageAaveEvent => ({
                          type: 'POSITION_CLOSED',
                        }),
                      ),
                    },
                  })
                  .withContext({
                    ...transactionStateMachine.context,
                    transactionParameters: contextToTransactionParameters(context),
                  }),
                {
                  name: 'transactionMachine',
                },
              ),
            })),
          },
        })
        .withContext({
          token,
          riskRatio: new RiskRatio(new BigNumber(1.1), RiskRatio.TYPE.MULITPLE),
          userInput: {
            riskRatio: new RiskRatio(new BigNumber(1.1), RiskRatio.TYPE.MULITPLE),
            amount: new BigNumber(0),
          },
          inputDelay: 1000,
          address,
          strategy,
        })
    }),
  )
}
