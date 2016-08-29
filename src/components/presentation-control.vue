<template>
  <div class="footer-icon-group presentation-footer-control">
    <span
      aria-label="Previous Slide"
      class="footer-icon-item hint--top-left hint--rounded"
      :class="{disabled: status.switching && status.direction === 'left'}"
      @click="moveSlide('left')">
      <svg-icon name="arrowLeft" class="footer-icon"></svg-icon>
    </span>
    <span class="footer-icon-item">
      {{ status.current + 1 }}/{{ status.total }}
    </span>
    <span
      aria-label="Next Slide"
      class="footer-icon-item hint--top-right hint--rounded"
      :class="{disabled: status.switching && status.direction === 'right'}"
      @click="moveSlide('right')">
      <svg-icon name="arrowRight" class="footer-icon"></svg-icon>
    </span>
  </div>
</template>

<script>
  import SvgIcon from 'components/svg-icon'

  export default {
    props: ['writingMode'],
    vuex: {
      getters: {
        status: state => {
          const tab = state.editor.tabs[state.editor.currentTabIndex]
          return {
            direction: tab.slideDirection,
            switching: tab.isSlideSwitching,
            current: tab.slideIndex,
            total: tab.html.length
          }
        }
      },
      actions: {
        moveSlide({dispatch}, direction) {
          dispatch('MOVE_SLIDE', direction)
        }
      }
    },
    mounted() {
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
