<template>
  <div class="footer-icon-group writing-modes">
    <span
      aria-label="Editor only"
      class="footer-icon-item writing-mode hint--top-left hint--rounded"
      :class="{active: writingMode === 'editor'}"
      @click="setWritingMode('editor')">
      <svg-icon name="pencil" class="footer-icon"></svg-icon>
    </span>
    <span
      aria-label="Editor and Preview"
      class="footer-icon-item writing-mode hint--top-left hint--rounded"
      :class="{active: writingMode === 'default'}"
      @click="setWritingMode('default')">
      <svg-icon name="alignHorizontalMiddle" class="footer-icon"></svg-icon>
    </span>
    <span
      aria-label="Preview only"
      class="footer-icon-item writing-mode hint--top-left hint--rounded"
      :class="{active: writingMode === 'preview'}"
      @click="setWritingMode('preview')">
      <svg-icon name="eye" class="footer-icon"></svg-icon>
    </span>
  </div>
</template>

<script>
  import {ipcRenderer} from 'electron'
  import SvgIcon from 'components/svg-icon'

  const modes = ['editor', 'default', 'preview']

  export default {
    props: {
      writingMode: {
        required: true,
        type: String
      },
      currentTabIndex: {
        required: true,
        type: Number
      }
    },
    mounted() {
      this.addListeners()
    },
    methods: {
      addListeners() {
        ipcRenderer.on('switch-writing-mode', () => {
          const current = modes.indexOf(this.writingMode)
          if (current === modes.length - 1) {
            this.setWritingMode(modes[0])
          } else {
            this.setWritingMode(modes[current + 1])
          }
        })
      },
      removeListeners() {
        window.removeEventListener('keydown', this.handleSwitchingMode)
      },
      setWritingMode(mode) {
        this.$store.commit('SET_WRITING_MODE', {
          index: this.currentTabIndex,
          mode
        })
      }
    },
    beforeDestroy() {
      this.removeListeners()
    },
    components: {
      SvgIcon
    }
  }
</script>
