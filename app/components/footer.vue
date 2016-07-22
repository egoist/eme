<style>
  .footer {
    height: 30px;
    line-height: 30px;
    background-color: #f0f0f0;
    padding: 0 10px;
    font-size: 12px;
    color: #666;
    & > span {
      margin-right: 10px;
    }
  }
</style>

<template>
  <footer class="footer">
    <span class="file-path">untitled</span>
    <span class="word-count">{{ wordCount }} words</span>
  </footer>
</template>

<script>
  export default {
    vuex: {
      getters: {
        wordCount: state => state.editor.wordCount
      }
    }
  }
</script>
