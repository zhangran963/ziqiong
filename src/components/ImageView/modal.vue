<template>
  <div class="image-modal" @click.stop="onClose">
    <img :src="src" />
  </div>
</template>

<script lang="ts">
import { useDialog } from '@/hooks/useDialog'
export default {
  props: {
    src: {
      type: String,
    },
  },
  setup() {
    const $dialog = useDialog()

    const onClose = () => {
      $dialog.close()
    }

    return {
      onClose,
    }
  },
}
</script>

<style lang="scss">
.image-modal {
  img {
    max-width: 95vw;
    max-height: 95vh;
  }
}
</style>
