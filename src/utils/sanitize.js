import sanitizeHtml from 'sanitize-html'

function sanitizer(html) {
  return sanitizeHtml(html, sanitizer.config)
}

sanitizer.config = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'dd', 'del', 'div', 'dl', 'dt', 'h1', 'h2', 'iframe', 'img', 'input', 'ins', 'meta', 'path', 'pre', 's', 'span', 'sub', 'sup', 'svg'
  ]),
  allowedAttributes: {
    h1: ['id'],
    h2: ['id'],
    h3: ['id'],
    h4: ['id'],
    h5: ['id'],
    h6: ['id'],
    a: ['href', 'id', 'name', 'target', 'title', 'aria-hidden'],
    img: ['alt', 'id', 'src', 'width', 'height', 'align', 'valign', 'title', 'style'],
    p: ['align'],
    meta: ['name', 'content'],
    iframe: ['src', 'frameborder', 'allowfullscreen'],
    input: ['checked', 'class', 'disabled', 'type'],
    div: ['id'],
    pre: [],
    td: ['colspan', 'rowspan', 'style'],
    th: ['colspan', 'rowspan', 'style'],
    del: ['cite', 'datetime'],
    ins: ['cite', 'datetime'],
    path: ['d'],
    svg: ['aria-hidden', 'height', 'version', 'viewbox', 'width'],
    span: ['class', 'style'],
    ul: ['class'],
    li: ['class']
  },
  exclusiveFilter(frame) {
    // Allow Task List items
    if (frame.tag === 'input') {
      const isTaskItem = (frame.attribs.class && frame.attribs.class.indexOf('task-list-item-checkbox') > -1)
      const isCheckbox = (frame.attribs.type && frame.attribs.type === 'checkbox')
      const isDisabled = Object.prototype.hasOwnProperty.call(frame.attribs, 'disabled')
      return !(isTaskItem && isCheckbox && isDisabled)
    }

    // Allow YouTube iframes
    if (frame.tag !== 'iframe') return false
    return !String(frame.attribs.src).match(/^(https?:)?\/\/(www\.)?youtube\.com/)
  },
  transformTags: {
    td: sanitizeCellStyle,
    th: sanitizeCellStyle
  }
}

// Allow table cell alignment
function sanitizeCellStyle(tagName, attribs) {
  // if we don't add the 'style' to the allowedAttributes above, it will be
  // stripped out by the time we get here, so we have to filter out
  // everything but `text-align` in case something else tries to sneak in
  function cell(alignment) {
    const attributes = attribs
    if (alignment) {
      attributes.style = 'text-align:' + alignment
    } else {
      delete attributes.style
    }
    return {
      tagName,
      attribs: attributes
    }
  }

  // look for CSS `text-align` directives
  const alignmentRegEx = /text-align\s*:\s*(left|center|right)[\s;$]*/igm
  const result = alignmentRegEx.exec(attribs.style || '')
  return result ? cell(result[1]) : cell()
}

export default sanitizer
