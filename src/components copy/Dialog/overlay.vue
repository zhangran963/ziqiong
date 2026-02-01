<template>
  <div class="dialog-overlay" @touchmove.prevent>
    <component :is="dialogState.content" v-bind="dialogState.props"></component>
  </div>
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
.dialog-overlay {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 10000;
  background-color: rgba(0, 0, 0, 0.68);

  @include flex();
}
</style>
