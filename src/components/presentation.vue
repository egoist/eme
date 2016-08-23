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
      <div
        :class="[
          'slide',
          'markdown-body',
          'animated',
          attrs.align
        ]"
        :transition="transitionName"
        track-by="$index"
        v-for="slide in slides"
        v-show="$index === current"
        v-html="slide">
      </div>
    </div>
    <div class="indicator" :style="{width: ((current + 1) / total) * 100 + '%'}"></div>
  </div>
</template>

<script>
  export default {
    props: {
      slides: {
        type: Array
      }
    },
    vuex: {
      getters: {
        direction: state => state.editor.slideDirection,
        current: state => state.editor.currentSlideIndex,
        total: state => {
          const tab = state.editor.tabs[state.editor.currentTabIndex]
          return Array.isArray(tab.html) ? tab.html.length : 1
        },
        attrs: state => state.editor.tabs[state.editor.currentTabIndex].attrs || {}
      }
    },
    computed: {
      animation() {
        return this.attrs.animation || 'slide'
      },
      transitionName() {
        return `${this.animation}-${this.direction}`
      }
    },
    methods: {
      style(index) {
        return {
          transform: `translateX(${(index - this.current) * 100}%) translateY(0)`
        }
      }
    }
  }
</script>
