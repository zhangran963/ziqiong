import { reactive, createApp, nextTick, type Component } from 'vue'
import OverlayView from './overlay.vue'

const dialogState = reactive<{
  visible: boolean
  content: Component | null
  props: any
}>({
  visible: false,
  content: null,
  props: null,
})

interface TShow {
  (content: Component, options?: { props: any }): void
}

const show: TShow = async function (content, options) {
  dialogState.content = content
  if (options) {
    dialogState.props = options.props
  }
  dialogState.visible = true

  await nextTick()

  const dialogApp = createApp(OverlayView)
  dialogApp.provide('$dialog', $dialog)
  dialogApp.mount('#dialog-container')
}

const close = async function () {
  dialogState.visible = false
  dialogState.content = null
  dialogState.props = null
}

const $dialog = {
  dialogState,
  show,
  close,
}

export default $dialog

export type TDialogService = typeof $dialog
