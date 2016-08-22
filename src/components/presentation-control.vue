<template>
  <div class="footer-icon-group presentation-footer-control">
    <span
      aria-label="Previous Slide"
      class="footer-icon-item hint--top-left hint--rounded"
      @click="moveSlide('left')">
      <svg-icon name="arrowLeft" class="footer-icon"></svg-icon>
    </span>
    <span class="footer-icon-item">
      {{ slides.current + 1 }}/{{ slides.total }}
    </span>
    <span
      aria-label="Next Slide"
      class="footer-icon-item hint--top-right hint--rounded"
      @click="moveSlide('right')">
      <svg-icon name="arrowRight" class="footer-icon"></svg-icon>
    </span>
  </div>
</template>

<script>
  import SvgIcon from 'components/svg-icon'

  export default {
    props: ['slides'],
    vuex: {
      actions: {
        moveSlide({dispatch}, direction) {
          dispatch('MOVE_SLIDE', direction)
        }
      }
    },
    components: {
      SvgIcon
    }
  }
</script>
