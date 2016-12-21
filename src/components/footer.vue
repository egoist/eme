<style>
  .footer {
    height: 25px;
    line-height: 24px;
    background-color: #f0f0f0;
    padding: 0 10px;
    font-size: 12px;
    border-top: 1px solid;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    -webkit-app-region: drag;
    > span {
      margin-right: 10px;
    }

    .word-count-select {
      background-color: transparent;
      border: none;
      font-size: 12px;
      outline: none;
      -webkit-appearance: none;
      text-rendering: geometricPrecision;
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
          border: 1px solid;
          margin-left: -1px;
          padding: 0 5px;
          text-align: center;
          cursor: default;
          display: inline-block;
          float: left;
          position: relative;
          z-index: 1;
          &.active {
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
    -webkit-user-select: none;
    &:hover {
      color: #333;
    }
  }
  .footer-icon {
    svg {
      width: 12px;
    }
    .disabled & path {
      fill: #ccc;
    }
  }
  .writing-modes {
    display: inline-block;
  }
</style>

<template>
  <footer class="footer">
    <span class="file-path" v-if="status.filePath">{{ status.filePath }}</span>
    <span
      class="loading dots"
      v-show="status.exporting">
      Exporting
    </span>
    <span
      class="pdf-link clickable-link"
      v-if="status.pdf"
      @click="openPDF(status.pdf)">
      PDF
    </span>
    <span
      class="clickable-link"
      v-if="status.gist"
      @click="openURL(status.gist)">
      Gist
    </span>
    <span class="word-count">
      <select class="word-count-select">
        <option>{{ status.wordCount }} words</option>
        <option>{{ status.lineCount }} lines</option>
        <option>{{ status.charCount }} characters</option>
      </select>
    </span>
    <div class="footer-right">
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
  import {shell} from 'electron'
  import wordCount from 'wordcount'

  import WritingModes from 'components/writing-modes'

  export default {
    computed: {
      currentTabIndex() {
        return this.$store.state.editor.currentTabIndex
      },
      status() {
        const tab = this.$store.state.editor.tabs[this.$store.state.editor.currentTabIndex] || {}
        return {
          wordCount: tab.content ? wordCount(tab.content) : 0,
          charCount: tab.content ? tab.content.length : 0,
          lineCount: (tab.content && tab.editor) ? tab.editor.lineCount() : 0,
          filePath: tab.filePath ?
            tildify(tab.filePath) :
            'untitled',
          writingMode: tab.writingMode,
          pdf: tab.pdf,
          gist: tab.gist,
          exporting: tab.exporting
        }
      }
    },
    methods: {
      openPDF(pdf) {
        shell.showItemInFolder(pdf)
      },
      openURL(id) {
        shell.openExternal(`https://gist.github.com/${id}`)
      }
    },
    components: {
      WritingModes
    }
  }
</script>
