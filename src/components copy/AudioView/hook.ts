import { Howl } from 'howler'
import { ref } from 'vue'

export const useSound = () => {
  const sound = new Howl({
    src: ['https://ran-1303246897.file.myqcloud.com/www/lyric/audio/yesterday%20once%20more.m4a'],
    loop: true,
    volume: 0.5,
    autoplay: false,
  })
  return sound
}

export const useAudioContent = () => {
  const isPlaying = ref<boolean>(false)
  const rotate = ref<number>(0)
  let timer: number

  const play = async () => {
    isPlaying.value = true
    timer = window.setInterval(() => {
      rotate.value += 1
    }, 100)
  }

  const pause = async () => {
    isPlaying.value = false
    clearInterval(timer)
    console.log('pause: ', timer)
  }

  return {
    rotate,
    isPlaying,
    play,
    pause,
  }
}
