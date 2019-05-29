/**
 * 一些辅助工具函数
 */
export const ZOOM_STEP = 0.2
export const [MAX_ZOOM_SIZE, MIN_ZOOM_SIZE] = [3, 0.2]

let scrollBarCached

export default {
  getPosition ({ width, height }, box) {
    const [boxWidth, boxHeight] = [box.offsetWidth, box.offsetHeight]
    const ratio = width / height
    let w, h
    if (width > boxWidth) {
      if (height > boxHeight) {
        const r1 = width / boxWidth
        const r2 = height / boxHeight
        if (r1 > r2) {
          w = boxWidth
        } else {
          h = boxHeight
        }
      } else {
        w = boxWidth
      }
    } else {
      if (height > boxHeight) {
        h = boxHeight
      } else {
        w = width
      }
    }
    if (w) {
      h = w / ratio
    } else {
      w = h * ratio
    }
    const top = (boxHeight - h) / 2
    const left = (boxWidth - w) / 2
    return {
      width: w,
      height: h,
      top,
      left
    }
  },
  getZoomOffset ({ width, height }, box, rotate = false) {
    const [boxWidth, boxHeight] = [box.offsetWidth, box.offsetHeight]
    let top, left
    if (rotate) {
      if (width > boxHeight) {
        top = (width - height) / 2
      } else {
        top = (boxHeight - height) / 2
      }
      if (height > boxWidth) {
        left = (height - width) / 2
      } else {
        left = (boxWidth - width) / 2
      }
    } else {
      if (width > boxWidth) {
        left = 0
      } else {
        left = (boxWidth - width) / 2
      }
      if (height > boxHeight) {
        top = 0
      } else {
        top = (boxHeight - height) / 2
      }
    }

    return {
      top,
      left
    }
  },

  isInside (e, box) {
    if (!box) {
      return false
    }
    const rect = box.getBoundingClientRect()
    const x = e.clientX - document.body.offsetLeft
    const y = e.clientY - document.body.offsetTop
    if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
      return true
    }
    return false
  },

  isRotation (angle) {
    return angle % 180 !== 0
  },

  getZoomRatio (v, out = false) {
    const n = parseInt(v / ZOOM_STEP, 10)
    if (out) {
      // 缩小
      return Math.max(MIN_ZOOM_SIZE, (n - 1) * ZOOM_STEP)
    } else {
      // 放大
      return Math.min(MAX_ZOOM_SIZE, (n + 1) * ZOOM_STEP)
    }
  },

  addEvent (element, type, fn) {
    element.addEventListener
      ? element.addEventListener(type, fn, false)
      : element.attachEvent('on' + type, fn)
  },

  removeEvent (element, type, fn) {
    element.removeEventListener
      ? element.removeEventListener(type, fn, false)
      : element.detachEvent('on' + type, fn)
  },

  getScrollBarSize (fresh) {
    if (fresh || scrollBarCached === undefined) {
      const inner = document.createElement('div')
      inner.style.width = '100%'
      inner.style.height = '200px'

      const outer = document.createElement('div')
      const outerStyle = outer.style

      outerStyle.position = 'absolute'
      outerStyle.top = '0'
      outerStyle.left = '0'
      outerStyle.pointerEvents = 'none'
      outerStyle.visibility = 'hidden'
      outerStyle.width = '200px'
      outerStyle.height = '150px'
      outerStyle.overflow = 'hidden'

      outer.appendChild(inner)

      document.body.appendChild(outer)

      const widthContained = inner.offsetWidth
      outer.style.overflow = 'scroll'
      let widthScroll = inner.offsetWidth

      if (widthContained === widthScroll) {
        widthScroll = outer.clientWidth
      }

      document.body.removeChild(outer)

      scrollBarCached = widthContained - widthScroll
    }
    return scrollBarCached
  },

  stopDefault (e) {
    const event = e || window.event
    if (event.preventDefault) {
      event.preventDefault()
    } else {
      event.returnValue = false
    }
  }
}
