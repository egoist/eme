<style>
  .footer {
    height: 29px;
    line-height: 28px;
    background-color: #f0f0f0;
    padding: 0 10px;
    font-size: 12px;
    color: #666;
    border-top: 1px solid #e2e2e2;
    > span {
      margin-right: 10px;
    }
  }
</style>

<template>
  <footer class="footer">
    <span class="file-path">{{ filePath }}</span>
    <span class="word-count">{{ wordCount }} words</span>
  </footer>
</template>

<script>
  import tildify from 'tildify'

  export default {
    vuex: {
      getters: {
        wordCount: state => state.editor.wordCount,
        filePath: state => {
          return state.editor.filePath ?
            tildify(state.editor.filePath) :
            'untitled'
        }
      }
    }
  }
</script>
