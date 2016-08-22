<template>
  <div class="footer-icon-group writing-modes">
    <span
      aria-label="Editor only"
      class="footer-icon-item writing-mode hint--top-left hint--rounded"
      :class="{active: writingMode === 'writing'}"
      @click="setWritingMode('writing')">
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
  import SvgIcon from 'components/svg-icon'
  import {cmdOrCtrl} from 'utils/key'

  const modes = ['writing', 'default', 'preview']

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
    vuex: {
      actions: {
        setWritingMode({dispatch}, mode) {
          dispatch('SET_WRITING_MODE', {
            index: this.currentTabIndex,
            mode
          })
        }
      }
    },
    ready() {
      this.addListeners()
    },
    methods: {
      addListeners() {
        this.handleSwitchingMode = e => {
          if (e[cmdOrCtrl] && e.shiftKey && e.which === 220) {
            const current = modes.indexOf(this.writingMode)
            if (current === modes.length - 1) {
              this.setWritingMode(modes[0])
            } else {
              this.setWritingMode(modes[current + 1])
            }
          }
        }

        window.addEventListener('keydown', this.handleSwitchingMode, false)
      },
      removeListeners() {
        window.removeEventListener('keydown', this.handleSwitchingMode)
      }
    },
    beforeDestory() {
      this.removeListeners()
    },
    components: {
      SvgIcon
    }
  }
</script>
