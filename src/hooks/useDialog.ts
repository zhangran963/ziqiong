import { inject } from 'vue'
import type { TDialogService } from '@/components/Dialog/dialog'

interface TUseDialog {
  (): TDialogService
}
export const useDialog: TUseDialog = () => {
  const $dialog = inject<TDialogService>('$dialog') as TDialogService
  return $dialog
}
