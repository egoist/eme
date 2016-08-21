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
    .tab-container {
      display: flex;
    }
    .tab {
      height: $header-height;
      line-height: $header-height;
      padding: 0 10px;
      padding-right: 0;
      position: relative;
      text-align: center;
      border-left: 1px solid #ddd;
      border-bottom: 1px solid #ddd;
      display: flex;
      background-color: white;
      transition: margin .2s linear;
      -webkit-app-region: no-drag;
      .tab-title {
        color: #999;
        white-space: nowrap;
        -webkit-user-select: none;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 220px;
      }
      .dragzone {
        position: absolute;
        top: 0;
        bottom: 0;
        left: -1px;
        right: 0;
      }
      &:last-child {
        border-right: 1px solid #ddd;
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
      &.dragging {
        border-left: 1px solid #ddd;
      }
      &.drag-over {
        border-left-color: #1976D2;
        border-left-width: 2px;
        .dragzone {
          left: -2px;
        }
        &:before {
          content:"";
          border-style: solid;
          border-width: 5px 5px 5px 5px;
          border-color: transparent transparent transparent #1976D2;
          position: absolute;
          top: calc($header-height / 2);
          left: 0;
          transform: translateY(-50%);
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
      width: 30px;
      text-align: center;
      height: calc(100% - 1px);
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
      }
    }
  }
</style>

<template>
  <header class="header"
    :class="{'single-tab': tabs.length === 1, 'is-mac': isMac}"
    @dblclick="createNewTab"
    @mousewheel="tabbarScroll">
    <div class="tab-container">
      <div class="tab"
        @click="setCurrentTab($index)"
        id="tab{{ $index }}"
        data-index="{{ $index }}"
        v-for="tab in tabs"
        track-by="uid"
        :class="{'current-tab': $index === currentTabIndex}"
        drop="handleDragAndDrop"
        drag-start="handleDragStart"
        drag-enter="handleDragEnter"
        drag-leave="handleDragLeave"
        drag-end="handleDragEnd"
        @mouseover="hoverTab($index)"
        @mouseleave="unhoverTab($index)"
        v-drag-and-drop>
        <div :class="{'dragzone': dragging}"></div>
        <span class="tab-title" v-if="tab && !tab.rename">
          {{ tab.title || 'untitled' }}
        </span>
        <span class="tab-title" v-if="tab && tab.rename">
          <input type="text"
            class="rename-input"
            @dblclick.stop
            @click.stop
            @keyup.enter="renameCurrentFile($event, $index)"
            @keyup.esc="cancelRename($event, $index)"
            :value="tab.title" />
        </span>
        <span
          class="tab-indicator"
          @click.stop="closeTab($event, $index)"
          v-if="!dragging">
          <span class="dot" v-show="!tab.saved"></span>
          <span class="cross">×</span>
        </span>
        <span class="tab-indicator" v-if="dragging"></span>
      </div>
    </div>
  </header>
</template>

<script>
  import path from 'path'
  import {isMac} from 'utils/os'
  import event from 'utils/event'
  import {$$, $} from 'utils/dom'

  export default {
    vuex: {
      getters: {
        tabs: state => state.editor.tabs.map(tab => {
          return {
            title: path.basename(tab.filePath),
            saved: tab.saved,
            rename: tab.rename,
            uid: tab.uid
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
        },
        handleDragAndDrop({dispatch}, draggedElement, droppedOnElement) {
          const newIndex = droppedOnElement.getAttribute('data-index')
          const oldIndex = draggedElement.getAttribute('data-index')
          dispatch('REORDER_TABS', {
            newIndex: Number(newIndex),
            oldIndex: Number(oldIndex)
          })
          dispatch('UPDATE_DRAGGING_STATUS', false)
          event.emit('focus-current-tab')
          $$('.header .hover').forEach(el => el.classList.remove('hover'))
        },
        handleDragStart({dispatch}) {
          dispatch('UPDATE_DRAGGING_STATUS', true)
        },
        handleDragEnd({dispatch}) {
          if (this.dragging) {
            dispatch('UPDATE_DRAGGING_STATUS', false)
            event.emit('focus-current-tab')
            $$('.header .hover').forEach(el => el.classList.remove('hover'))
          }
        }
      }
    },
    data() {
      return {isMac}
    },
    ready() {
      this.listenEvents()
    },
    methods: {
      closeTab(e, index) {
        event.emit('close-tab', index)
      },
      createNewTab() {
        event.emit('new-tab', this.updateTabsStack)
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
      getTab(target) {
        const isTab = target.classList.contains('tab')
        const isDragzone = target.classList.contains('dragzone')
        if (isTab) {
          return target
        } else if (isDragzone) {
          return target.parentNode
        }
        return false
      },
      handleDragEnter(target) {
        const tab = this.getTab(target)
        if (tab) {
          tab.classList.add('drag-over')
        }
      },
      handleDragLeave(target) {
        const tab = this.getTab(target)
        if (tab) {
          tab.classList.remove('drag-over')
        }
      },
      hoverTab(index) {
        $(`#tab${index}`).classList.add('hover')
      },
      unhoverTab(index) {
        $(`#tab${index}`).classList.remove('hover')
      },
      tabbarScroll(event) {
        console.log(event)
      },
      updateTabsStack() {
        const header = $('.header')
        const tabContainer = $('.tab-container')
        const tabsWidth = tabContainer.scrollWidth
        const headerWidth = (isMac ? header.offsetWidth - 80 : header.offsetWidth) - 20
        let deltaWidth = tabsWidth - headerWidth
        if (deltaWidth > 0) {
          const tabs = tabContainer.children
          let i = 1
          while (tabs[i] && deltaWidth > 0) {
            const tab = tabs[i]
            const prevTabWidth = tabs[i - 1].offsetWidth
            const currentMargin = Math.abs(parseInt(tab.style.marginLeft, 10)) || 0
            if (currentMargin < prevTabWidth - 10) {
              const marginLeft = Math.min(deltaWidth + Math.abs(currentMargin), prevTabWidth - 10)
              tab.style.marginLeft = `-${marginLeft}px`
              deltaWidth -= marginLeft - currentMargin
            }
            ++i
          }
        }
      },
      listenEvents() {
        event.on('update-tabs', () => {
          this.updateTabsStack()
        })
      }
    }
  }
</script>
