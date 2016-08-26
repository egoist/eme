<style>
  .footer {
    height: 25px;
    line-height: 24px;
    background-color: #f0f0f0;
    padding: 0 10px;
    font-size: 12px;
    color: #666;
    border-top: 1px solid #e2e2e2;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    > span {
      margin-right: 10px;
    }

    .word-count-select {
      background-color: transparent;
      border: none;
      font-size: 12px;
      outline: none;
      color: #666; 
      -webkit-appearance: none;
    }

    &.mac-footer {
      box-shadow: inset 0 1px 0 #f5f4f5;
      background-image: linear-gradient(to bottom,#e8e6e8 0,#d1cfd1 100%);
      border-top: 1px solid #c2c0c2;
    }

    .footer-right {
      float: right;
      .footer-icon-group {
        -webkit-user-select: none;
        margin: 3.5px 0;
        &:not(:first-child) {
          margin-left: 10px;
        }
        .footer-icon-item {
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
            .footer-icon {
              path {
                fill: white;
              }
            }
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
    -webkit-user-select: none;
    &:hover {
      color: #333;
    }
  }
  .footer-icon {
    svg {
      width: 12px;
    }
    path {
      fill: #666;
    }
    .disabled & path {
      fill: #ccc;
    }
  }
  .presentation-footer-control,
  .writing-modes {
    display: inline-block;
  }
  .presentation-footer-control {
    svg {
      width: 14px;
    }
  }
</style>

<template>
  <footer class="footer" :class="{'mac-footer': isMac}">
    <span class="file-path" v-if="status.filePath">{{ status.filePath }}</span>
    <span class="word-count">
      <select class="word-count-select">
        <option>{{ status.wordCount }} words</option>
        <option>{{ status.lineCount }} lines</option>
        <option>{{ status.charCount }} characters</option>
      </select>
    </span>
    <span class="pdf-link clickable-link" v-if="status.pdf" @click="openPDF(status.pdf)">PDF</span>
    <div class="footer-right">
      <presentation-control
        :writing-mode="status.writingMode"
        v-if="status.isPresentationMode">
      </presentation-control>
      <writing-modes
        :writing-mode="status.writingMode"
        :current-tab-index="currentTabIndex"
        v-if="status.writingMode">
      </writing-modes>
    </div>
  </footer>
</template>

<script>
  import tildify from 'tildify'
  import {isMac} from 'utils/os'
  import {shell} from 'electron'
  import wordCount from 'wordcount'

  import PresentationControl from 'components/presentation-control'
  import WritingModes from 'components/writing-modes'

  export default {
    vuex: {
      getters: {
        currentTabIndex: state => state.editor.currentTabIndex,
        status: state => {
          const tab = state.editor.tabs[state.editor.currentTabIndex] || {}
          return {
            wordCount: tab.content ? wordCount(tab.content) : 0,
            charCount: tab.content ? tab.content.length : 0,
            lineCount: (tab.content && tab.editor) ? tab.editor.lineCount() : 0,
            filePath: tab.filePath ?
              tildify(tab.filePath) :
              'untitled',
            writingMode: tab.writingMode,
            pdf: tab.pdf,
            isPresentationMode: tab.isPresentationMode
          }
        }
      }
    },
    data() {
      return {
        isMac
      }
    },
    methods: {
      openPDF(pdf) {
        shell.showItemInFolder(pdf)
      }
    },
    components: {
      PresentationControl,
      WritingModes
    }
  }
</script>
