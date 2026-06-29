const MIRROR_PROPERTIES = [
  'boxSizing',
  'width',
  'height',
  'overflowX',
  'overflowY',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontSize',
  'lineHeight',
  'fontFamily',
  'textAlign',
  'textTransform',
  'letterSpacing',
  'wordSpacing',
  'tabSize',
  'whiteSpace',
  'wordWrap',
  'wordBreak',
]

export function getTextareaCaretCoordinates(textarea, position) {
  const style = window.getComputedStyle(textarea)
  const mirror = document.createElement('div')

  mirror.setAttribute('aria-hidden', 'true')
  mirror.style.position = 'absolute'
  mirror.style.visibility = 'hidden'
  mirror.style.top = '0'
  mirror.style.left = '-9999px'
  mirror.style.overflow = 'hidden'

  MIRROR_PROPERTIES.forEach((property) => {
    mirror.style[property] = style[property]
  })

  mirror.style.width = `${textarea.offsetWidth}px`

  const textBeforeCaret = textarea.value.slice(0, position)
  mirror.textContent = textBeforeCaret

  const marker = document.createElement('span')
  marker.textContent = textarea.value.slice(position) || '.'
  mirror.appendChild(marker)

  document.body.appendChild(mirror)

  const coordinates = {
    top: marker.offsetTop - textarea.scrollTop,
    left: marker.offsetLeft - textarea.scrollLeft,
    height: marker.offsetHeight,
  }

  document.body.removeChild(mirror)

  return coordinates
}
