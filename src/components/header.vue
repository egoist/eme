<style>
  $header-height: 36px;
  .header {
    font-size: 12px;
    display: flex;
    cursor: default;
    height: $header-height;
    border-bottom: 1px solid #ddd;
    -webkit-app-region: drag;
    &:hover {
      .settings-trigger {
        opacity: 1;
      }
    }
    &.is-mac {
      padding-left: 80px;
      .full-screen & {
        padding-left: 0;
      }
    }
    .tab-container {
      display: flex;
      width: calc(100% - 50px);
      overflow: hidden;
      height: $header-height;
      &:hover {
        overflow: auto;
        overflow-y: hidden;
      }
      &.undraggable {
        -webkit-app-region: no-drag;
      }
    }
    .tab {
      height: $header-height;
      line-height: $header-height;
      padding: 0 10px;
      padding-right: 40px;
      position: relative;
      text-align: center;
      border-left: 1px solid #ddd;
      border-bottom: 1px solid #ddd;
      display: flex;
      flex: 1;
      width: 100%;
      white-space: nowrap;
      background-color: white;
      overflow: hidden;
      text-overflow: ellipsis;
      .tab-title {
        color: #999;
        -webkit-user-select: none;
        width: 100%;
        display: block;
        &.rename-input {
          height: 24px;
          line-height: 24px;
          align-self: center;
          padding: 5px;
        }
      }
      &.current-tab {
        border-left-color: #1976D2;
        background-color: white;
        border-left-width: 2px;
        border-bottom: none;
        .tab-title {
          color: #333;
        }
      }
      &.hover {
        .tab-indicator {
          background-color: rgba(255, 255, 255, 0.84);
          .dot {
            display: none;
          }
          .cross {
            display: block;
          }
          &:hover {
            font-weight: bold;
          }
        }
      }
    }

    &:not(.single-tab) {
      .tab:last-child {
        border-right: 1px solid #ddd;
      }
    }

    &.single-tab {
      .tab {
        &.current-tab {
          border-bottom: 1px solid #ddd;
          border-left-width: 1px;
          border-left-color: #ddd;
          border-right: 0 solid #ddd;
        }
      }
      &:hover {
        .tab {
          &.current-tab {
            border-right-width: 1px;
          }
        }
      }
    }

    .tab-indicator {
      -webkit-user-select: none;
      width: 30px;
      text-align: center;
      height: calc(100% - 1px);
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      >span {
        position: relative;
        top: -1px;
      }
      .dot {
        width: 5px;
        height: 5px;
        background-color: #4b89ff;
        border-radius: 50%;
        display: inline-block;
      }
      .cross {
        display: none;
        font-size: 1rem;
        transition: all .3s;
        position: absolute;
        width: 12px;
        line-height: 10px;
        padding: 1px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }

    .settings-trigger {
      $color: #b1b1b1;
      $colorActive: #666;

      opacity: 0;
      display: flex;
      justify-content: center;
      width: 50px;
      svg {
        width: 14px;
        color: $color;
        circle {
          color: $color;
        }
      }
      &:hover {
        svg {
          color: $colorActive;
          circle {
            color: $colorActive;
          }
        }
      }
    }
  }
</style>

<template>
  <header
    class="header single-tab"
    v-el:header
    :class="{'single-tab': tabs.length === 1, 'is-mac': isMac}"
    @dblclick="createNewTab">
    <div class="tab-container"
      :class="{undraggable: tabs.length > 1}"
      v-el:tab-container>
      <div class="tab"
        @click="setCurrentTab($index)"
        :id="'tab-' + $index"
        :data-index="$index"
        v-for="tab in tabs"
        track-by="$index"
        :class="{'current-tab': $index === currentTabIndex}"
        @mouseover="hoverTab($index)"
        @mouseleave="unhoverTab($index)">
        <span class="tab-title" v-if="tab && !tab.rename">
          {{ tab.title || 'untitled' }}
        </span>
        <input type="text"
          v-if="tab && tab.rename"
          class="rename-input tab-title"
          @dblclick.stop
          @click.stop
          @keyup.enter="renameCurrentFile($event, $index)"
          @keyup.esc="cancelRename($event, $index)"
          :value="tab.title" />
        <span
          class="tab-indicator"
          v-if="!dragging">
          <span class="dot" v-show="!tab.saved"></span>
          <span class="cross" @click.stop="closeTab($event, $index)">×</span>
        </span>
        <span class="tab-indicator" v-if="dragging"></span>
      </div>
    </div>
    <svg-icon
      class="settings-trigger"
      name="settings"
      @mousedown="clickable = true"
      @mousemove="clickable = false"
      @mouseup="openSettings">
    </svg-icon>
  </header>
</template>

<script>
  import path from 'path'
  import {isMac} from 'utils/os'
  import event from 'utils/event'
  import {$} from 'utils/dom'
  import SvgIcon from 'components/svg-icon'

  export default {
    vuex: {
      getters: {
        tabs: state => state.editor.tabs.map(tab => {
          return {
            title: path.basename(tab.filePath),
            saved: tab.saved,
            rename: tab.rename
          }
        }),
        currentTabIndex: state => state.editor.currentTabIndex,
        dragging: state => state.editor.draggingTab
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
      return {
        isMac,
        clickable: false
      }
    },
    methods: {
      closeTab(e, index) {
        event.emit('close-tab', index)
      },
      createNewTab() {
        event.emit('new-tab')
      },
      renameCurrentFile(e, index) {
        const name = e.target.value
        if (name) {
          event.emit('file-rename', name, index)
        } else {
          this.$store.dispatch('UPDATE_RENAME_STATUS', {
            index,
            rename: false
          })
        }
      },
      cancelRename(e, index) {
        this.$store.dispatch('UPDATE_RENAME_STATUS', {
          index,
          rename: false
        })
      },
      hoverTab(index) {
        $(`#tab-${index}`).classList.add('hover')
      },
      unhoverTab(index) {
        $(`#tab-${index}`).classList.remove('hover')
      },
      openSettings() {
        if (this.clickable) {
          this.$store.dispatch('TOGGLE_PREFERENCE_PANE')
        }
      }
    },
    components: {
      SvgIcon
    }
  }
</script>
