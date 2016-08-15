export default ({html, css}) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        ${css ? `<link rel="stylesheet" href="${css}" />` : ''}
        <title>EME</title>
      <head>
      <body>
        ${html}
      </body>
    </html>
    `
}
