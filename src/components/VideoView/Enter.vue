<template>
  <div class="entervideo" @click.stop="onClick">
    <img class="entervideo-icon" src="/src/assets/video-icon.svg" alt="video" />
  </div>
</template>

<script lang="ts">
import { useDialog } from '@/hooks/useDialog'
import VideoModal from '@/components/VideoView/modal.vue'

export default {
  name: 'EnterVideo',
  setup() {
    const $dialog = useDialog()

    const onClick = () => {
      $dialog.show(VideoModal)
    }

    return {
      onClick,
    }
  },
}
</script>

<style lang="scss">
.entervideo {
  perspective: 700px;

  box-shadow: 0 1px 15px rgba(0, 0, 0, 0.2), 0 3px 25px rgba(0, 0, 0, 0.5);

  display: inline-block;
  width: 60px;
  height: 60px;
  border-radius: 50%;

  @include flex();
  &-icon {
    width: 88%;
    height: 88%;
  }
}
</style>
