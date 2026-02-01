import { defineAsyncComponent, onMounted, ref } from 'vue'
import { fetchLyricList, type ILyricItem } from '@/services/lyric'
import ImageWrapVue from '@/components/ImageWrap.vue'
import { useDialog } from '@/hooks/useDialog'

export const useList = () => {
  const lyrics = ref<ILyricItem[]>([])
  const getList = async () => {
    try {
      const res = await fetchLyricList()
      lyrics.value = res.data
    } catch (err) {
      console.error(err)
    }
  }

  onMounted(() => {
    getList()
  })

  return {
    lyrics,
  }
}

export const useScroll = () => {
  const wraps = ref<InstanceType<typeof ImageWrapVue>[]>([])
  const screenHeight = window.innerHeight
  const offset = screenHeight * 0.5 // 偏移量
  const onScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const params = { topEdge: scrollTop - offset, bottomEdge: scrollTop + screenHeight + offset }

    wraps.value.forEach(($wrap) => {
      $wrap.refresh(params)
    })
  }

  const start = async () => {
    window.onscroll = onScroll
    onScroll()
  }

  return {
    wraps,
    start,
  }
}

export const usePreviewImage = () => {
  const $dialog = useDialog()
  const onPreview = (item: ILyricItem) => {
    $dialog.show(
      defineAsyncComponent(() => import('@/components/ImageView/modal.vue')),
      {
        props: {
          src: item.url,
        },
      }
    )
  }

  return {
    onPreview,
  }
}
