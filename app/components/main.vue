<style>
  .main {
    display: flex;
    height: calc(100% - 36px);
  }
  .editor {
    overflow: auto;
    width: 50%;
    .CodeMirror {
      background-color: white !important;
      padding: 0 10px;
      height: 100%;
    }
  }
  .preview {
    width: 50%;
  }
</style>

<template>
  <div class="main">
    <div class="editor">
      <textarea id="editor" v-el:editor></textarea>
    </div>
    <div class="preview markdown-body">
      {{{ html }}}
    </div>
  </div>
</template>

<script>
  import CodeMirror from 'codemirror'
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/mode/markdown/markdown'
  import 'codemirror/mode/gfm/gfm'
  import 'codemirror/theme/base16-light'
  import 'codemirror/addon/edit/continuelist'
  import MarkdownIt from 'markdown-it'

  const md = new MarkdownIt()

  export default {
    data() {
      return {
        text: '',
        html: ''
      }
    },
    ready() {
      this.initEditor()
    },
    methods: {
      initEditor() {
        const editor = CodeMirror.fromTextArea(this.$els.editor, {
          mode: 'gfm',
          theme: 'base16-light',
          lineNumbers: false,
          matchBrackets: true,
          lineWrapping: true,
          extraKeys: {
            "Enter": "newlineAndIndentContinueMarkdownList"
          }
        })

        editor.on('change', e => {
          this.text = e.getValue()
          this.html = md.render(this.text)
        })
      }
    }
  }
</script>
