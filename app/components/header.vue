<style>
  $header-height: 36px;
  .header {
    font-size: 12px;
    display: flex;
    cursor: default;
    height: $header-height;
    border-bottom: 1px solid #ddd;
    -webkit-app-region: drag;
    &.is-mac {
      padding-left: 80px;
    }
    .tab {
      height: $header-height;
      line-height: $header-height;
      padding: 0 10px;
      position: relative;
      text-align: center;
      border-left: 1px solid #ddd;
      .tab-title {
        color: #999;
        white-space: nowrap;
        -webkit-user-select: none;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 220px;
        display: inline-block;
      }
      &:last-child {
        border-right: 1px solid #ddd;
      }
      &.current-tab {
        border-left-color: #1976D2;
        background-color: white;
        border-left-width: 2px;
        .tab-title {
          color: #333;
        }
      }
      &:hover {
        .save-indicator {
          display: none;
        }
        .close-indicator {
          display: inline-block;
        }
      }
    }

    &.single-tab {
      .tab {
        .tab-title {
          color: #333;
        }
        &:first-child {
          border-left-color: #1976D2;
          background-color: white;
          border-left-width: 2px;
          .tab-title {
            color: #333;
          }
        }
      }
    }

    .tab-indicator {
      -webkit-user-select: none;
      height: calc(100% - 1px);
      width: 30px;
      text-align: center;
      display: inline-block;
      margin-left: 5px;
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      transition: all .3s;
      background-color: rgba(255, 255, 255, 0.84);
      .dot {
        width: 5px;
        height: 5px;
        background-color: blue;
        border-radius: 50%;
        display: inline-block;
      }
    }

    .close-indicator {
      display: none;
      font-weight: bold;
      &:hover {
        color: #999;
      }
    }
  }
</style>

<template>
  <header class="header"
    :class="{'single-tab': tabs.length === 1, 'is-mac': isMac}"
    @dblclick="createNewTab">
    <div class="tab"
      @click="setCurrentTab($index)"
      v-for="tab in tabs"
      :class="{'current-tab': $index === currentTabIndex}">
      <span class="tab-title" v-if="tab">
        {{ tab.title || 'untitled' }}
      </span>
      <span class="tab-indicator save-indicator" v-show="!tab.saved">
        <span class="dot"></span>
      </span>
      <span class="tab-indicator close-indicator" @click="closeTab($event, $index)">
        <span class="cross">×</span>
      </span>
    </div>
  </header>
</template>

<script>
  import path from 'path'
  import {isMac} from 'utils/os'
  import event from 'utils/event'

  export default {
    vuex: {
      getters: {
        tabs: state => state.editor.tabs.map(tab => {
          return {
            title: path.basename(tab.filePath),
            saved: tab.saved
          }
        }),
        currentTabIndex: state => state.editor.currentTabIndex
      },
      actions: {
        setCurrentTab({dispatch}, index) {
          dispatch('SET_CURRENT_TAB', index)
          setTimeout(() => {
            event.emit('focus-current-tab')
          }, 200)
        }
      }
    },
    data() {
      return {isMac}
    },
    methods: {
      closeTab(e, index) {
        e.stopPropagation()
        event.emit('close-tab', index)
      },
      createNewTab() {
        event.emit('new-tab')
      }
    }
  }
</script>
