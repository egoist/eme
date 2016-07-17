<style>
  $header-height: 36px;
  .header {
    display: flex;
    height: $header-height;
    padding-left: 80px;
    border-bottom: 1px solid #e2e2e2;
    -webkit-app-region: drag;
    .tab {
      height: $header-height;
      line-height: $header-height;
      width: 100%;
      border-bottom: 1px solid #e2e2e2;
      border-left: 1px solid #e2e2e2;
      position: relative;
      text-align: center;
      &:not(:last-child) {
        border-right: 1px solid #e2e2e2;
      }
      .tab-title {
        margin-left: -80px;
        -webkit-user-select: none;
      }
    }
    &.single-tab {
      border-bottom: none;
      .tab {
        border-left: none;
        border-bottom: none;
      }
    }
  }
</style>

<template>
  <header class="header"
    :class="{'single-tab': tabs.length < 2}">
    <div class="tab">
      <span class="tab-title">
        blank
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
