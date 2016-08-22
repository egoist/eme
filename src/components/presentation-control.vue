<template>
  <div class="footer-icon-group presentation-footer-control">
    <span
      aria-label="Previous Slide"
      class="footer-icon-item hint--top-left hint--rounded"
      :class="{disabled: switching && direction === 'left'}"
      @click="moveSlide('left')">
      <svg-icon name="arrowLeft" class="footer-icon"></svg-icon>
    </span>
    <span class="footer-icon-item">
      {{ slides.current + 1 }}/{{ slides.total }}
    </span>
    <span
      aria-label="Next Slide"
      class="footer-icon-item hint--top-right hint--rounded"
      :class="{disabled: switching && direction === 'right'}"
      @click="moveSlide('right')">
      <svg-icon name="arrowRight" class="footer-icon"></svg-icon>
    </span>
  </div>
</template>

<script>
  import SvgIcon from 'components/svg-icon'

  export default {
    props: ['slides', 'writingMode'],
    vuex: {
      getters: {
        direction: state => state.editor.slideDirection,
        switching: state => state.editor.isSlideSwitching,
      },
      actions: {
        moveSlide({dispatch}, direction) {
          dispatch('MOVE_SLIDE', direction)
        }
      }
    },
    ready() {
      this.addListerners()
    },
    methods: {
      addListerners() {
        this.handleArrowKeys = e => {
          if (this.writingMode === 'preview') {
            if (e.key === 'ArrowRight') {
              this.moveSlide('right')
            } else if (e.key === 'ArrowLeft') {
              this.moveSlide('left')
            }
          }
        }

        window.addEventListener('keydown', this.handleArrowKeys, false)
      }
    },
    beforeDestroy() {
      window.removeEventListener('keydown', this.handleArrowKeys)
    },
    components: {
      SvgIcon
    }
  }
</script>
