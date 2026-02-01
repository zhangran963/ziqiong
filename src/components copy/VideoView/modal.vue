<template>
  <div class="video-modal">
    <!-- 视频 -->
    <video
      class="video"
      poster="https://ran-1303246897.file.myqcloud.com/www/lyric/video/yesterday%20once%20more.jpg"
      src="https://ran-1303246897.file.myqcloud.com/www/lyric/video/yesterday%20once%20more%20-%20360p.mp4"
      controls="true"
      preload="auto"
      webkit-playsinline="true"
      playsinline="true"
      x-webkit-airplay="allow"
      x5-video-player-type="h5"
      x5-video-player-fullscreen="true"
      x5-video-orientation="landscape"
    ></video>

    <i class="close-icon" @click="onClose"></i>
  </div>
</template>

<script setup lang="ts">
import { useDialog } from '@/hooks/useDialog'

const $dialog = useDialog()
const onClose = () => {
  $dialog.close()
}
</script>

<style lang="scss" scoped>
.video-modal {
  display: flex;
  justify-content: center;
  align-items: center;

  .video {
    width: 100%;
    max-width: 600px;
    height: auto;
    border-radius: 4px;
  }

  .close-icon {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAeFBMVEUAAADy8vLz8/Pz8/P19fXz8/Pw8PDy8vLy8vL19fXy8vLy8vL////z8/Py8vLy8vLx8fHr6+vq6ury8vLz8/Pz8/Py8vLx8fHy8vLz8/Py8vLz8/Py8vLx8fHy8vLv7+/w8PDy8vLy8vLx8fH09PTy8vLy8vLy8vKO+PtbAAAAJ3RSTlMA+dIVHKYg18sYoyYF9ttxJAwKxXtmXkjy4pOATzYSDzKtilpCmDts70/kAAABOElEQVQ4y5VT2ZaDIAw1VnBFrVp3q11m7v//4SjU1gXnnPIQSG5IbhIwvlsB/x384AjlWUoAQGlj6WBvQkPHCQGA7VwuJYRXJNOxLxihvKzxen3JugH1kssPKF/feBDqRXzQc5vzKfDOEgvke9Y5yjmpB7aCtuaYBJcH/6wMZ18VTqRCZPAUDvM07ScT/itEI3cHhbpojh4SNxNpaJHK/hOkLiHblULpCYlgooBqlLNHaEtcrQrxKDs4xtvDBkKFq+TDKIf/HDpJPjxKEYJPJAV6PcmeKFiWmejKVI1im0ZRLA0MmRo+yDpoNZ+nctMNK4I3vx+Bh8bBatzP6KnYwtfounqSIt8liJbqHWD8o/LIGiNsnz15rSyjbxnhvqc0WoHKMSsAxFwt69fXczJ++HmtrosD46v1B7TuGX/st918AAAAAElFTkSuQmCC');
    background-size: 80%;
    background-position: center;
    background-repeat: no-repeat;

    display: inline-block;
    width: 36px;
    height: 36px;
    // outline: 1px solid white;

    position: absolute;
    left: 50%;
    bottom: 1.6em;
    transform: translateX(-50%);
  }
}
</style>
