<style src="hint.css/hint.css"></style>
<style src="codemirror/lib/codemirror.css"></style>
<style src="src/css/normalize"></style>
<style src="src/css/reset"></style>
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
        'full-screen': isFullScreen,
        'is-mac': platform === 'darwin'
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
  import {platform} from 'utils/os'

  const currentWindow = remote.getCurrentWindow()

  export default {
    data() {
      return {
        isDistractionFreeMode: false,
        isFullScreen: currentWindow.isFullScreen(),
        platform
      }
    },
    computed: {
      theme() {
        return this.$store.state.app.settings.theme
      },
      tabsAmount() {
        return this.$store.state.editor.tabs.length
      },
      showPreferencePane() {
        return this.$store.state.app.showPreferencePane
      },
      highlight() {
        return this.$store.state.app.settings.preview.highlight
      }
    },
    components: {
      appHeader,
      appMain,
      appFooter,
      preferencePane
    },
    mounted() {
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
      },
      togglePreferencePane() {
        this.$store.commit('TOGGLE_PREFERENCE_PANE')
      }
    }
  }
</script>
