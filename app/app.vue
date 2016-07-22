<style src="github-markdown-css"></style>
<style src="./css/reset"></style>

<template>
  <div id="app">
    <app-header></app-header>
    <app-main></app-main>
  </div>
</template>

<script>
  import appHeader from './components/header'
  import appMain from './components/main'
  import appFooter from './components/footer'

  export default {
    components: {
      appHeader,
      appMain,
      appFooter
    }
  }
</script>
