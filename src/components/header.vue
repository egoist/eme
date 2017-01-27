<style>
  $header-height: 36px;
  .header {
    font-size: 12px;
    display: flex;
    cursor: default;
    height: $header-height;
    border-bottom: 1px solid;
    -webkit-app-region: drag;
    &:hover {
      .settings-trigger {
        opacity: 1;
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
    }
    .tab {
      height: $header-height;
      line-height: $header-height;
      padding: 0 10px;
      padding-right: 40px;
      position: relative;
      text-align: center;
      border-left: 1px solid;
      border-bottom: 1px solid;
      display: flex;
      flex: 1;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      .tab-title {
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
        border-left-width: 2px;
        border-bottom: none;
      }
      &.hover {
        .tab-indicator {
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
        border-right: 1px solid;
      }
    }

    &.single-tab {
      .tab {
        padding-left: 90px;
        &.current-tab {
          border-bottom: 1px solid;
          border-left-width: 1px;
          border-right: 1px solid transparent;
          &:not(.unsaved) {
            border-right-color: transparent;
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
      opacity: 0;
      display: flex;
      justify-content: center;
      width: 50px;
      svg {
        width: 14px;
      }
    }
  }

  .is-mac {
    .header {
      padding-left: 80px;
      .full-screen & {
        padding-left: 0;
      }
      &.single-tab {
        .tab {
          padding-left: 0;
        }
      }
    }
  }
</style>

<template>
  <header
    class="header single-tab"
    ref="header"
    :class="{'single-tab': tabs.length === 1}"
    @dblclick="createNewTab">
    <div class="tab-container"
      ref="tab-container">
      <div class="tab"
        v-for="(tab, index) in tabs"
        @click="setCurrentTab(index)"
        :id="'tab-' + index"
        :data-index="index"
        :key="tab.id"
        :class="{'current-tab': index === currentTabIndex, unsaved: !tab.saved}"
        @mouseover="hoverTab(index)"
        @mouseleave="unhoverTab(index)">
        <span class="tab-title" v-if="tab && !tab.rename">
          {{ tab.title || 'untitled-' + (tab.id) }}
        </span>
        <input type="text"
          v-if="tab && tab.rename"
          class="rename-input tab-title"
          @dblclick.stop
          @click.stop
          @keyup.enter="renameCurrentFile($event, index)"
          @keyup.esc="cancelRename($event, index)"
          :value="tab.title" />
        <span
          class="tab-indicator"
          v-if="!dragging">
          <span class="dot" v-show="!tab.saved"></span>
          <span class="cross" @click.stop="closeTab($event, index)">×</span>
        </span>
        <span class="tab-indicator" v-if="dragging"></span>
      </div>
    </div>
    <svg-icon
      class="settings-trigger"
      name="settings"
      @mousedown.native="clickable = true"
      @mousemove.native="clickable = false"
      @mouseup.native="openSettings">
    </svg-icon>
  </header>
</template>

<script>
  import path from 'path'
  import event from 'utils/event'
  import {$} from 'utils/dom'
  import {cmdOrCtrl} from 'utils/key'
  import SvgIcon from 'components/svg-icon'

  function getLeftTabIndex(total, active) {
    return (total + (active - 1)) % total
  }

  function getRightTabIndex(total, active) {
    return (active + 1) % total
  }

  export default {
    data() {
      return {
        clickable: false
      }
    },
    computed: {
      tabs() {
        return this.$store.state.editor.tabs.map(tab => {
          return {
            title: path.basename(tab.filePath),
            saved: tab.saved,
            rename: tab.rename,
            id: tab.id
          }
        })
      },
      currentTabIndex() {
        return this.$store.state.editor.currentTabIndex
      },
      dragging() {
        return this.$store.state.editor.draggingTab
      }
    },
    created() {
      Mousetrap.bindGlobal(`${cmdOrCtrl}+shift+[`, () => {
        if (this.tabs.length < 2) return
        const index = getLeftTabIndex(this.tabs.length, this.currentTabIndex)
        this.setCurrentTab(index)
      })
      Mousetrap.bindGlobal(`${cmdOrCtrl}+shift+]`, () => {
        if (this.tabs.length < 2) return
        const index = getRightTabIndex(this.tabs.length, this.currentTabIndex)
        this.setCurrentTab(index)
      })
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
          event.emit('file-rename', index, name)
        } else {
          this.$store.commit('UPDATE_RENAME_STATUS', {
            index,
            rename: false
          })
        }
      },
      cancelRename(e, index) {
        this.$store.commit('UPDATE_RENAME_STATUS', {
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
        console.log('Settings. Clickable: ', this.clickable)
        if (this.clickable) {
          this.$store.commit('TOGGLE_PREFERENCE_PANE')
        }
      },
      setCurrentTab(index) {
        this.$store.commit('SET_CURRENT_TAB', index)
        setTimeout(() => {
          event.emit('focus-current-tab')
        }, 200)
      }
    },
    components: {
      SvgIcon
    }
  }
</script>
