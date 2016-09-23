<style>
  .pane {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 70%;
    height: 70vmin;
    overflow: hidden;
    box-shadow: 0 0 30px rgba(0,0,0,.1);
    border: 1px solid #bebebe;
    border-radius: 6px;
    z-index: 9990;
    background-color: #ececec;
    .pane-header {
      background-color: #e8e6e8;
      background-image: linear-gradient(to bottom,#e8e6e8 0,#d1cfd1 100%);
      border-bottom: 1px solid #c2c0c2;
      height: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #555;
      font-size: 12px;
      cursor: default;
      box-shadow: inset 0 1px 0 #f5f4f5;
      user-select: none;
    }
    .pane-tabs {
      margin-top: -1px;
      display: flex;
      border-top: 1px solid #989698;
      border-bottom: 1px solid #989698;
    }
    .pane-tab {
      color: #666;
      user-select: none;
      flex: 1;
      padding: 3px;
      font-size: 12px;
      text-align: center;
      position: relative;
      border-left: 1px solid #989698;
      background-color: #b8b6b8;
      background-image: linear-gradient(to bottom,#b8b6b8 0,#b0aeb0 100%);

      &:first-child {
        border-left: 0;
      }

      &.active {
        background-color: #d4d2d4;
        background-image: linear-gradient(to bottom,#d4d2d4 0,#cccacc 100%);
      }

      &:after {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        content: "";
        opacity: 0;
        transition: opacity .1s linear;
        z-index: 1;
        background-color: rgba(0,0,0,.08);
      }

      &:hover:not(.active):after {
        opacity: 1
      }
    }
    .pane-body {
      padding: 10px 20px;
      height: 100%;
      overflow: auto;
      form {
        label {
          display: block;
          width: 100%;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .form-group {
          margin-bottom: 10px;
          max-width: 90%;
        }
        .form-control {
          outline: none;
          font-size: 16px;
          width: 100%;
          &:not([type="range"]) {
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 3px;
          }
          &:not([type="range"]):focus {
            border-color: #6db3fd;
            box-shadow: 3px 3px 0 #6db3fd,-3px -3px 0 #6db3fd,-3px 3px 0 #6db3fd,3px -3px 0 #6db3fd;
          }
          &[type="range"] {
            border: none;
          }
        }
      }
    }
  }
</style>

<template>
  <div class="pane preference-pane">
    <header class="pane-header">Preferences</header>
    <div class="pane-tabs">
      <div
        class="pane-tab"
        :class="{active: active === $index}"
        @click="active = $index"
        v-for="tab in tabs">
        {{ tab }}
      </div>
    </div>
    <div class="pane-body" v-show="active === 0">
      <form class="row">
        <div class="col col-half">
          <div class="form-group">
            <label>App Theme</label>
            <select class="form-control" v-model="settings.theme">
              <option
                value="white"
                :selected="settings.theme === 'white'">
                White
              </option>
              <option
                value="dark"
                :selected="settings.theme === 'dark'">
                Dark
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Color Schema</label>
            <select class="form-control" v-model="settings.colorSchema">
              <option
                :value="colorSchema"
                v-for="colorSchema in colorSchemas"
                :selected="settings.colorSchema === colorSchema">
                {{ colorSchema }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Code Highlight Style</label>
            <select class="form-control" v-model="settings.highlight">
              <option
                :value="highlight"
                v-for="highlight in highlights"
                :selected="settings.highlight === highlight">
                {{ highlight }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Default Writing Mode</label>
            <select class="form-control" v-model="settings.writingMode">
              <option
                value="default"
                :selected="settings.writingMode === 'default'">
                Show both editor and preview
              </option>
              <option
                value="editor"
                :selected="settings.writingMode === 'editor'">
                Editor only
              </option>
              <option
                value="preview"
                :selected="settings.writingMode === 'preview'">
                Preview only
              </option>
            </select>
          </div>
        </div>
        <div class="col col-half">
          <div class="form-group">
            <label>Font Size: {{ settings.fontSize }}px</label>
            <input
              type="range"
              min="12"
              max="60"
              class="form-control"
              v-model="settings.fontSize">
          </div>
          <div class="form-group">
            <label>Font Family</label>
            <input
              type="text"
              class="form-control"
              v-model="settings.font">
          </div>
          <div class="form-group">
            <label>Tab Size</label>
            <input
              type="number"
              class="form-control"
              v-model="settings.tabSize">
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="settings.indentWithTabs"> Indent With Tabs
            </label>
          </div>
        </div>
      </form>
    </div>

    <div class="pane-body" v-show="active === 1">
      <form class="row">
        <div class="col col-half">
          <div class="form-group">
            <label>New Tab</label>
            <input
              type="text"
              class="form-control"
              v-model="settings.keys.openNewTab">
          </div>
          <div class="form-group">
            <label>Open File</label>
            <input
              type="text"
              class="form-control"
              v-model="settings.keys.openFile">
          </div>
          <div class="form-group">
            <label>Open Last Session</label>
            <input
              type="text"
              class="form-control"
              v-model="settings.keys.openLastSession">
          </div>
          <div class="form-group">
            <label>Switching Writing Mode</label>
            <input
              type="text"
              class="form-control"
              v-model="settings.keys.switchWritingMode">
          </div>
        </div>
        <div class="col col-half">
          <div class="form-group">
            <label>Distraction Free Mode</label>
            <input
              type="text"
              class="form-control"
              v-model="settings.keys.distractionFreeMode">
          </div>
          <div class="form-group">
            <label>Focus Mode</label>
            <input
              type="text"
              class="form-control"
              v-model="settings.keys.focusMode">
          </div>
          <div class="form-group">
            <label>Vim Mode</label>
            <input
              type="text"
              class="form-control"
              v-model="settings.keys.vimMode">
          </div>
          <div class="form-group">
            <label>Presentation Mode</label>
            <input
              type="text"
              class="form-control"
              v-model="settings.keys.presentationMode">
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
  import {remote, ipcRenderer} from 'electron'
  import event from 'utils/event'

  const currentWindow = remote.getCurrentWindow()
  const $config = currentWindow.$config

  export default {
    data() {
      return {
        tabs: ['General', 'Keys'],
        active: 0,
        settings: JSON.parse(JSON.stringify($config.get('settings'))),
        colorSchemas: [
          'base16-light',
          'tomorrow-night-bright'
        ],
        highlights: [
          'github',
          'tomorrow-night-bright'
        ]
      }
    },
    created() {
      this.$watch('settings', () => {
        this.update()
      }, {deep: true})
    },
    methods: {
      update() {
        if (this.settings.theme === 'dark') {
          // force switching colorSchema to a readable one in dark mode
          this.settings.colorSchema = 'tomorrow-night-bright'
        }
        this.$store.dispatch('UPDATE_SETTINGS', this.settings)
        event.emit('update-editor-options', {
          theme: this.settings.colorSchema,
          tabSize: this.settings.tabSize,
          indentWithTabs: this.settings.indentWithTabs
        })
      }
    },
    beforeDestroy() {
      $config.set('settings', this.settings)
      ipcRenderer.send('reload-menu')
    }
  }
</script>
