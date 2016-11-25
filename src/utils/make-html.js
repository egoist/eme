export default ({html, css, data}) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        ${css ? css.map(style => `<link rel="stylesheet" href="${style}" />`).join('\n') : ''}
        <title>EME</title>
      <head>
      <body class="pdf">
        ${Array.isArray(html) ?
          html
            .map(html => {
              const className = data.attrs.align || ''
              return `<div class="slide markdown-body ${className}">
                ${html}
              </div>`
            })
            .join('<div class="page-break"></div>') :
          `<div class="markdown-body">${html}</div>`}
      </body>
      <script>
        window.saveTo = ${JSON.stringify(data.saveTo)}
      </script>
      <script>
        const {ipcRenderer} = require('electron')
        const $$ = document.querySelectorAll.bind(document)

        document.addEventListener('DOMContentLoaded', () => {
          document.body.style.height = parseInt(getComputedStyle(document.body).height) / 2 + 'px'

          $$('.slide').forEach(el => {
            el.style.height = '100%'
          })

          ipcRenderer.send('pdf-window-ready', {
            saveTo: window.saveTo
          })
        })
      </script>
    </html>
    `
}
