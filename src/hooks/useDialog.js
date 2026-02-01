import { inject } from 'vue'

export const useDialog = () => {
  const $dialog = inject('$dialog')
  return $dialog
}
