<style>
  .pane {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 70%;
    height: 70vmin;
    overflow: hidden;
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
      height: 26px;
      border-left: 1px solid #989698;
      background-color: #b8b6b8;
      background-image: linear-gradient(to bottom,#b8b6b8 0,#b0aeb0 100%);
      transition: box-shadow .3s linear;
      cursor: default;

      &:first-child {
        border-left: 0;
      }

      &.active {
        background-color: #d4d2d4;
        background-image: linear-gradient(to bottom,#d4d2d4 0,#cccacc 100%);
      }

      &:hover:not(.active) {
        box-shadow: inset 0 0 5px #999;
      }
    }
    .pane-body {
      padding: 10px 20px;
      height: calc(100% - 50px);
      overflow: auto;
      form {
        label {
          display: block;
          width: 100%;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .label-description {
          margin: 0;
          padding: 5px 0;
          color: #666;
          font-size: 12px;
          margin-top: -6px;
          line-height: 1.4;
          a {
            color: #4078c0;
            text-decoration: none;
          }
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
    .pane-sub-tabs {
      margin-bottom: 20px;
      display: flex;
      text-align: center;
      align-items: center;
      justify-content: center;
    }
    .pane-sub-tab {
      font-size: 14px;
      display: inline-block;
      background-color: white;
      border: 1px solid #ccc;
      border-bottom-color: #afafaf;
      padding: 0 10px;
      text-align: center;
      cursor: default;
      user-select: none;
      &:first-child {
        border-radius: 5px 0 0 5px;
      }
      &:last-child {
        border-radius: 0 5px 5px 0;
      }
      &:not(:last-child) {
        border-right: none;
      }
      &.active {
        background-color: #3694f7;
        color: white;
        border-color: #3694f7;
        &+span {
          border-left: none;
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
        v-for="(tab, index) in tabs"
        class="pane-tab"
        :class="{active: active === index}"
        @click="active = index"
        >
        {{ tab }}
      </div>
    </div>
    <div class="pane-body" v-show="active === 0">
      <div class="pane-sub-header">
        <div class="pane-sub-tabs">
          <span
            class="pane-sub-tab"
            :class="{active: activeSub.general === 'app'}"
            @click="activeSub.general = 'app'">
            App
          </span>
          <span
            class="pane-sub-tab"
            :class="{active: activeSub.general === 'editor'}"
            @click="activeSub.general = 'editor'">
            Editor
          </span>
          <span
            class="pane-sub-tab"
            :class="{active: activeSub.general === 'preview'}"
            @click="activeSub.general = 'preview'">
            Preview
          </span>
        </div>
      </div>
      <form class="row" v-if="activeSub.general === 'app'">
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
        </div>

        <div class="col col-half">
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
      </form>

      <form class="row" v-if="activeSub.general === 'editor'">
        <div class="col col-half">
          <div class="form-group">
            <label>Editor Theme</label>
            <select class="form-control" v-model="settings.editor.theme">
              <option
                :value="theme"
                v-for="theme in editorThemes"
                :selected="settings.editor.theme === theme">
                {{ theme }}
              </option>
            </select>
          </div>
        </div>
        <div class="col col-half">
          <div class="form-group">
            <label>Font Size: {{ settings.editor.fontSize }}px</label>
            <input
              type="range"
              min="12"
              max="60"
              class="form-control"
              v-model="settings.editor.fontSize">
          </div>
          <div class="form-group">
            <label>Font Family</label>
            <input
              type="text"
              class="form-control"
              v-model="settings.editor.font">
          </div>
          <div class="form-group">
            <label>Tab Size</label>
            <input
              type="number"
              class="form-control"
              v-model="settings.editor.tabSize">
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="settings.editor.indentWithTabs"> Indent With Tabs
            </label>
          </div>
        </div>
      </form>

      <form class="row" v-if="activeSub.general === 'preview'">
        <div class="col col-half">
          <div class="form-group">
            <label>Code Syntax Highlight</label>
            <select class="form-control" v-model="settings.preview.highlight">
              <option
                :value="highlight"
                v-for="highlight in highlights"
                :selected="settings.preview.highlight === highlight">
                {{ highlight }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Code Font</label>
            <input
              type="text"
              class="form-control"
              v-model="settings.preview.codeFont">
          </div>
        </div>

        <div class="col col-half">
          <div class="form-group">
            <label>Font Size: {{ settings.preview.fontSize }}px</label>
            <input
              type="range"
              min="12"
              max="60"
              class="form-control"
              v-model="settings.preview.fontSize">
          </div>
          <div class="form-group">
            <label>Font Family</label>
            <input
              type="text"
              class="form-control"
              v-model="settings.preview.font">
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
            <label>Night Mode</label>
            <input
              type="text"
              class="form-control"
              v-model="settings.keys.toggleNightMode">
          </div>
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

    <div class="pane-body" v-show="active === 2">
      <form>
        <div class="form-group">
          <label>GitHub Gist</label>
          <label>
            <input v-model="settings.autoSaveGist" type="checkbox"> Auto-update GitHub Gist after you save the file (only available when you filled in a GitHub token below)
          </label>
          <p class="label-description" v-if="settings.autoSaveGist">Generate a private token at
          &nbsp;<a target="_blank" href="https://github.com/settings/tokens">github.com/settings/tokens</a>, and select scope `gist`.
            <a target="_blank" href="https://gist.github.com/egoist/6855062dca8cd02d5b74430066d740b8">Still have no clue?</a>
          </p>
          <input
            type="text"
            class="form-control"
            v-if="settings.autoSaveGist"
            v-model="settings.tokens.github">
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
        tabs: ['General', 'Keys', 'Sync'],
        active: 0,
        activeSub: {
          general: 'app'
        },
        settings: JSON.parse(JSON.stringify($config.get('settings'))),
        editorThemes: [
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
        this.$store.commit('UPDATE_SETTINGS', this.settings)
        event.emit('update-editor-options', {
          theme: this.settings.editor.theme,
          tabSize: this.settings.editor.tabSize,
          indentWithTabs: this.settings.editor.indentWithTabs
        })
      }
    },
    beforeDestroy() {
      $config.set('settings', this.settings)
      ipcRenderer.send('reload-menu')
    }
  }
</script>
