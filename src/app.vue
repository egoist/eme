<style src="hint.css/hint.css"></style>
<style src="./css/reset"></style>
<style src="./css/editor-reset"></style>

<template>
  <div id="app">
    <app-header></app-header>
    <app-main></app-main>
    <app-footer></app-footer>
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
