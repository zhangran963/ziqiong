<template>
  <Transition>
    <div id="dialog-container" v-if="dialogState.visible"></div>
  </Transition>
</template>
<script lang="ts">
import DialogService from './dialog'
export default {
  setup() {
    const { dialogState, close } = DialogService

    return {
      dialogState,
      close,
    }
  },
}
</script>
<style lang="scss">
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
