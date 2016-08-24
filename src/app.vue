<style src="hint.css/hint.css"></style>
<style src="animate.css/animate.css"></style>
<style src="./css/reset"></style>
<style src="./css/editor-reset"></style>

<template>
  <div id="app"
    :class="{
      'distraction-free': isDistractionFreeMode,
      'full-screen': isFullScreen
    }">
    <app-header v-if="!isDistractionFreeMode || (isDistractionFreeMode && !isFullScreen)"></app-header>
    <app-main></app-main>
    <app-footer v-if="showFooter()"></app-footer>
  </div>
</template>

<script>
  import {ipcRenderer, remote} from 'electron'

  import appHeader from './components/header'
  import appMain from './components/main'
  import appFooter from './components/footer'
  import {$} from 'utils/dom'

  const currentWindow = remote.getCurrentWindow()

  export default {
    data() {
      return {
        isDistractionFreeMode: false,
        isFullScreen: currentWindow.isFullScreen()
      }
    },
    vuex: {
      getters: {
        tabsAmount: state => state.editor.tabs.length,
      }
    },
    components: {
      appHeader,
      appMain,
      appFooter
    },
    ready() {
      ipcRenderer.on('toggle-distraction-free-mode', () => {
        this.isDistractionFreeMode = !this.isDistractionFreeMode
      })
      ipcRenderer.on('enter-full-screen', () => {
        this.isFullScreen = true
      })
      ipcRenderer.on('leave-full-screen', () => {
        this.isFullScreen = false
      })
    },
    methods: {
      showFooter() {
        return this.tabsAmount > 0 &&
          (
            !this.isDistractionFreeMode ||
            (this.isDistractionFreeMode && !this.isFullScreen)
          )
      }
    }
  }
</script>
