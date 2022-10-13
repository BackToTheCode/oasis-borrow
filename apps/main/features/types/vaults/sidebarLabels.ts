import { ManageBorrowVaultStage } from 'apps/main/features/borrow/manage/pipes/manageVault'
import { OpenVaultStage } from 'apps/main/features/borrow/open/pipes/openVault'
import { ManageMultiplyVaultStage } from 'apps/main/features/multiply/manage/pipes/manageMultiplyVault'

export type SidebarVaultStages = OpenVaultStage | ManageBorrowVaultStage | ManageMultiplyVaultStage
export type SidebarFlow = 'openBorrow' | 'manageBorrow' | 'openMultiply' | 'manageMultiply' | 'openGuni' | 'manageGuni' | 'addSl'
