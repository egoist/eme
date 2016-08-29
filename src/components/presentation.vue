<style>
  .presentation {
    height: 100%;
    overflow: hidden;

    .full-screen & {
      .indicator {
        background-color: orange;
        height: 3px;
        position: absolute;
        bottom: 0;
        left: 0;
        transition: width .3s ease;
      }
    }
  }
  .slides {
    height: 100%;
    position: relative;
  }
</style>

<template>
  <div class="presentation">
    <div class="slides">
      <template v-for="(slide, index) in slides">
        <presentation-transition :animation="animation" :direction="status.direction">
          <div
            :class="[
              'slide',
              'markdown-body',
              'animated',
              status.attrs.align
            ]"
            :key="index"
            v-show="index === status.current"
            v-html="slide">
          </div>
        </presentation-transition>
      </template>
    </div>
    <div class="indicator" :style="{width: ((status.current + 1) / status.total) * 100 + '%'}"></div>
  </div>
</template>

<script>
  import PresentationTransition from 'components/presentation-transition'

  export default {
    name: 'presentation',
    props: {
      slides: {
        type: Array
      }
    },
    vuex: {
      getters: {
        status: state => {
          const tab = state.editor.tabs[state.editor.currentTabIndex]
          return {
            total: Array.isArray(tab.html) ? tab.html.length : 1,
            attrs: tab.attrs,
            direction: tab.slideDirection,
            current: tab.slideIndex
          }
        }
      }
    },
    computed: {
      animation() {
        return this.status.attrs.animation || 'slide'
      },
      transitionName() {
        return `${this.animation}-${this.status.direction}`
      }
    },
    methods: {
      style(index) {
        return {
          transform: `translateX(${(index - this.status.current) * 100}%) translateY(0)`
        }
      }
    },
    components: {
      PresentationTransition
    }
  }
</script>
