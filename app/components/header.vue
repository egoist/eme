<style>
  $header-height: 36px;
  .header {
    display: flex;
    height: $header-height;
    padding-left: 80px;
    -webkit-app-region: drag;
    .tab {
      height: $header-height;
      line-height: $header-height;
      width: 100%;
      position: relative;
      text-align: center;
      .tab-title {
        margin-left: -80px;
        -webkit-user-select: none ;
      }
    }
  }
</style>

<template>
  <header class="header">
    <div class="tab">
      <span class="tab-title">
        untitled
      </span>
    </div>
  </header>
</template>

<script>
  export default {
    data() {
      return {
        tabs: []
      }
    }
  }
</script>
