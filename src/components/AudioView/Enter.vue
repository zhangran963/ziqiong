<template>
  <div class="enteraudio" @click="toggle()">
    <EnterAudioContent :deg="rotate"></EnterAudioContent>
  </div>
</template>

<script lang="ts">
import { watch } from 'vue'
import { useDialog } from '@/hooks/useDialog'
import { useSound, useAudioContent } from './hook'
import EnterAudioContent from './content.vue'

export default {
  name: 'EnterAudio',
  components: {
    EnterAudioContent,
  },
  setup() {
    const sound = useSound()
    const contentInfo = useAudioContent()
    const { rotate } = contentInfo

    const toggle = (isNextPlaying = !sound.playing()) => {
      if (isNextPlaying) {
        sound.play()
        contentInfo.play()
      } else {
        sound.pause()
        contentInfo.pause()
      }
    }

    // 显示弹窗, 暂停音乐
    const $dialog = useDialog()
    watch($dialog.dialogState, ({ visible }) => {
      if (visible) {
        toggle(false)
      }
    })

    return {
      rotate,
      toggle,
    }
  },
}
</script>

<style lang="scss">
.enteraudio {
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
