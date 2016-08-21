<style>
  .presentation {
    height: 100%;
    position: relative;
    overflow: hidden;
    h1, h2, h3 {
      margin: 0;
      border-bottom: none;
    }
    img {
      max-width: 80%;
      display: block;
      margin: 0 auto;
    }
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
  .slide {
    display: flex;
    padding: 10px;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    flex-wrap: nowrap;
    transition: transform .3s ease;
    &.left, &.right {
      img {
        margin: 0;
      }
    }
    &.left {
      align-items: stretch;
    }
    &.right {
      align-items: flex-end;
      img {
        float: right;
      }
    }
    &.top {
      justify-content: flex-start;
    }
    &.bottom {
      justify-content: flex-end;
    }
  }
</style>

<template>
  <div class="presentation">
    <div
      :class="[
        'slide',
        'markdown-body',
        attrs.align
      ]"
      :style="style($index)"
      track-by="$index"
      v-for="slide in slides"
      v-html="slide">
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
        current: state => state.editor.currentSlideIndex,
        total: state => {
          const tab = state.editor.tabs[state.editor.currentTabIndex]
          return Array.isArray(tab.html) ? tab.html.length : 1
        },
        attrs: state => state.editor.tabs[state.editor.currentTabIndex].attrs || {}
      }
    },
    methods: {
      style(index) {
        return {
          transform: `translateX(${100 * index - this.current * 100}%) translateY(0)`
        }
      }
    }
  }
</script>
