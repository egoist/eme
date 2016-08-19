export default ({html, css}) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        ${css ? css.map(style => `<link rel="stylesheet" href="${style}" />`).join('\n') : ''}
        <title>EME</title>
      <head>
      <body>
        ${html}
      </body>
    </html>
    `
}
