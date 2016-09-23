<style src="hint.css/hint.css"></style>
<style src="animate.css/animate.css"></style>
<style src="codemirror/lib/codemirror.css"></style>
<style src="./css/reset"></style>
<style src="src/css/theme/white"></style>
<style src="src/css/theme/dark"></style>
<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9980;
  }
</style>

<template>
  <div id="app"
    :class="[
      {
        'distraction-free': isDistractionFreeMode,
        'full-screen': isFullScreen
      },
      'theme-' + theme,
      highlight
    ]">
    <div
      class="overlay"
      @click="togglePreferencePane"
      v-if="showPreferencePane">
    </div>
    <preference-pane v-if="showPreferencePane"></preference-pane>
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
  import preferencePane from './components/preference-pane'
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
        showPreferencePane: state => state.app.showPreferencePane,
        theme: state => state.app.settings.theme,
        highlight: state => state.app.settings.highlight
      },
      actions: {
        togglePreferencePane({dispatch}) {
          dispatch('TOGGLE_PREFERENCE_PANE')
        }
      }
    },
    components: {
      appHeader,
      appMain,
      appFooter,
      preferencePane
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
