<style>
  .footer {
    height: 25px;
    line-height: 24px;
    background-color: #f0f0f0;
    padding: 0 10px;
    font-size: 12px;
    color: #666;
    border-top: 1px solid #e2e2e2;
    > span {
      margin-right: 10px;
    }

    &.mac-footer {
      box-shadow: inset 0 1px 0 #f5f4f5;
      background-image: linear-gradient(to bottom,#e8e6e8 0,#d1cfd1 100%);
      border-top: 1px solid #c2c0c2;
    }
  }
</style>

<template>
  <footer class="footer" v-if="showFooter && status" :class="{'mac-footer': isMac}">
    <span class="file-path">{{ status.filePath }}</span>
    <span class="word-count">{{ status.wordCount }} words</span>
  </footer>
</template>

<script>
  import tildify from 'tildify'
  import {isMac} from 'utils/os'

  export default {
    vuex: {
      getters: {
        showFooter: state => state.editor.tabs.length > 0,
        status: state => {
          const editor = state.editor.tabs[state.editor.currentTabIndex]
          return editor && {
            wordCount: editor.wordCount,
            filePath: editor.filePath ?
              tildify(editor.filePath) :
              'untitled'
          }
        }
      }
    },
    data() {
      return {isMac}
    }
  }
</script>
