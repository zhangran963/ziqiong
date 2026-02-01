<template>
  <div class="image-wrap" ref="wrap">
    <div class="image-wrap-front">
      <slot v-if="show"></slot>
    </div>
    <div class="image-wrap-back" v-if="show"></div>
  </div>
</template>

<script lang="ts">
const WHeight = window.innerHeight
const ratio = 0
export default {
  // props: {
  //   topOffset: {
  //     type: Number,
  //     default: WHeight * ratio,
  //   },
  //   bottomOffset: {
  //     type: Number,
  //     default: WHeight * ratio,
  //   },
  // },
  inheritAttrs: false,
  data() {
    return {
      top: 0,
      bottom: 0,
      show: false,
      isActive: false,
    }
  },
  mounted() {
    const wrapEle = this.$refs.wrap as HTMLDivElement
    const { top, bottom } = wrapEle.getBoundingClientRect()

    this.top = top
    this.bottom = bottom
  },
  methods: {
    refresh({ topEdge = 0, bottomEdge = 0 } = {}) {
      if (this.bottom < bottomEdge) {
        this.show = true
      }

      if (this.top > topEdge && this.bottom < bottomEdge) {
        this.isActive = true
      } else {
        this.isActive = false
      }
    },
  },
}
</script>

<style lang="scss">
.image-wrap {
  list-style-type: none;
  -webkit-transform: translate3d(0, 0, 0);
  -moz-transform: translate3d(0, 0, 0);
  -ms-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);

  position: relative;
  border-radius: 2px;
  /* Android机兼容性好; Apple兼容性差 */
  transform-style: preserve-3d;
  transform-origin: 50%;
  transition: transform 640ms ease-in-out;

  &:nth-child(odd) {
    .image-wrap-front,
    .image-wrap-back {
      background-color: #e7f7ff;
    }
  }

  &:nth-child(even) {
    .image-wrap-front,
    .image-wrap-back {
      background-color: #ece1da;
    }
  }

  .image-wrap-front,
  .image-wrap-back {
    backface-visibility: hidden;
    position: absolute;
    width: 100%;
    height: 100%;

    @include flex();
  }

  .image-wrap-front {
    z-index: 2;
  }

  .image-wrap-back {
    z-index: 1;
    background-color: rgba($color: #000000, $alpha: 0.3);
    /* 使背面的元素: 面向后 + 倒立 */
    transform: translateZ(0px) rotateX(180deg) rotateZ(180deg);
  }
}
</style>
