<style scoped>
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

    .footer-right {
      float: right;
      .writing-modes {
        margin: 3.5px 0;
        .writing-mode {
          height: 16px;
          line-height: 16px;
          background-color: #fcfcfc;
          background-image: linear-gradient(to bottom,#fcfcfc 0,#f1f1f1 100%);
          border: 1px solid;
          border-color: #c2c0c2 #c2c0c2 #a19fa1;
          box-shadow: 0 1px 1px rgba(0,0,0,.06);
          margin-left: -1px;
          padding: 0 5px;
          text-align: center;
          cursor: default;
          display: inline-block;
          float: left;
          position: relative;
          z-index: 1;
          &.active {
            background-color: #6d6c6d;
            background-image: none;
            color: white;
            border-color: transparent;
            z-index: 2;
          }
          &:first-child {
            border-radius: 4px 0 0 4px;
          }
          &:last-child {
            border-radius: 0 4px 4px 0;
          }
        }
      }
    }
  }
  .clickable-link {
    cursor: default;
    &:hover {
      color: #333;
    }
  }
</style>

<template>
  <footer class="footer" v-if="showFooter && status" :class="{'mac-footer': isMac}">
    <span class="file-path">{{ status.filePath }}</span>
    <span class="word-count">{{ status.wordCount }} words</span>
    <span class="pdf-link clickable-link" v-if="status.pdf" @click="openPDF(status.pdf)">PDF</span>
    <div class="footer-right">
      <div class="writing-modes">
        <span
          class="writing-mode"
          :class="{active: status.writingMode === 'writing'}"
          @click="setWritingMode('writing')">
          <span class="icon-pencil"></span>
        </span>
        <span
          class="writing-mode"
          :class="{active: status.writingMode === 'default'}"
          @click="setWritingMode('default')">
          <span class="icon-align-horizontal-middle"></span>
        </span>
        <span
          class="writing-mode"
          :class="{active: status.writingMode === 'preview'}"
          @click="setWritingMode('preview')">
          <span class="icon-eye"></span>
        </span>
      </div>
    </div>
  </footer>
</template>

<script>
  import tildify from 'tildify'
  import {isMac} from 'utils/os'
  import {shell} from 'electron'

  export default {
    vuex: {
      getters: {
        showFooter: state => state.editor.tabs.length > 0,
        currentTabIndex: state => state.editor.currentTabIndex,
        status: state => {
          const editor = state.editor.tabs[state.editor.currentTabIndex]
          return editor && {
            wordCount: editor.wordCount,
            filePath: editor.filePath ?
              tildify(editor.filePath) :
              'untitled',
            writingMode: editor.writingMode,
            pdf: editor.pdf
          }
        }
      },
      actions: {
        setWritingMode({dispatch}, mode) {
          dispatch('SET_WRITING_MODE', {
            index: this.currentTabIndex,
            mode
          })
        }
      }
    },
    data() {
      return {isMac}
    },
    methods: {
      openPDF(pdf) {
        shell.openExternal(`file://${pdf}`)
      }
    }
  }
</script>
