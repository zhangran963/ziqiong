<template>
  <header class="lyrics-header">
    <EnterVideo></EnterVideo>
    <EnterAudio></EnterAudio>
  </header>
  <main class="lyrics-main">
    <template v-for="(item, index) of lyrics" :key="index">
      <ImageWrap v-bind="item" ref="wraps">
        <img
          class="lyrics-main-img"
          :src="`${item.url}?imageMogr2/thumbnail/!20p`"
          @click="onPreview(item)"
        />
      </ImageWrap>
    </template>
  </main>
</template>

<script lang="ts">
import ImageWrap from '@/components/ImageWrap.vue'
import { useList, useScroll, usePreviewImage } from './hooks'
import { watch, defineAsyncComponent } from 'vue'
import { nextTick } from 'vue'

export default {
  components: {
    ImageWrap,
    EnterVideo: defineAsyncComponent(() => import('@/components/VideoView/Enter.vue')),
    EnterAudio: defineAsyncComponent(() => import('@/components/AudioView/Enter.vue')),
  },
  setup() {
    const listInfo = useList()
    const scrollInfo = useScroll()
    const previewInfo = usePreviewImage()

    // 有数据后, 可监听
    watch(listInfo.lyrics, async (items) => {
      if (items.length) {
        // 待DOM布局完成
        await nextTick()
        scrollInfo.start()
      }
    })

    return {
      ...listInfo,
      ...scrollInfo,
      ...previewInfo,
    }
  },
}
</script>

<style lang="scss">
.lyrics-header {
  @include flex(space-between);
  padding: 15px 15px 0;
  margin-bottom: 30px;

  position: sticky;
  top: 0;
  z-index: 10;
}

.lyrics-main {
  padding-left: 0;
  padding-right: 0;

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  grid-auto-rows: 170px;
  grid-gap: 2px; // 行列的间距
  grid-auto-flow: row dense; // 即使某项超宽, 改变网页宽度时, 也能满填充

  // perspective: 1000px;

  &-img {
    max-width: 90%;
  }
}

/* 宽大一些的屏幕 */
@media (min-width: 640px) {
  .lyrics-main {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    grid-auto-rows: 320px;

    &-img {
      max-width: 84%;
    }
  }
}
</style>
