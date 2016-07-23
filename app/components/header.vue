<style>
  $header-height: 36px;
  .header {
    font-size: 12px;
    display: flex;
    height: $header-height;
    -webkit-app-region: drag;
    .tab {
      height: $header-height;
      line-height: $header-height;
      width: 100%;
      position: relative;
      text-align: center;
      .tab-title {
        -webkit-user-select: none ;
      }
    }

    .unsaved-indicator {
      height: 5px;
      width: 5px;
      background-color: blue;
      border-radius: 50%;
      display: inline-block;
      margin-left: 5px;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }
  }
</style>

<template>
  <header class="header" v-if="isMac">
    <div class="tab">
      <span class="tab-title">
        {{ filePath || 'untitled' }}
        <span class="unsaved-indicator" v-show="!saved"></span>
      </span>
    </div>
  </header>
</template>

<script>
  import path from 'path'
  import {isMac} from 'utils/os'

  export default {
    vuex: {
      getters: {
        saved: state => state.editor.saved,
        filePath: state => {
          return state.editor.filePath ?
            path.basename(state.editor.filePath) :
            'untitled'
        }
      }
    },
    data() {
      return {isMac}
    }
  }
</script>
