/**
 * 一些辅助工具函数
 */
let scrollBarCached
// 缓存body原有的样式属性
let originPosition;
let originWidth;
let originTop;
// body是否已设置成fixed阻止滚动
let fixed = false

export const isMac = /macintosh|mac os x/i.test(navigator.userAgent)
export const isMobile = /ipad|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(navigator.userAgent.toLowerCase())

export default {
  getPosition ({ width, height, minZoomSize, maxZoomSize }, box) {
    const [boxWidth, boxHeight] = [box.offsetWidth, box.offsetHeight]
    const ratio = width / height
    let w, h
    if (width > boxWidth) {
      if (height > boxHeight) {
        // 如果图片宽高大于容器，取取图片宽或高将容器一边填满
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

    // 设置了最小缩放比例时，如果计算的宽高小于它，那么使用设置的最小缩放比例
    if (minZoomSize && (w / width) < minZoomSize) {
      w = width * minZoomSize
      h = height * minZoomSize
    }

    if (maxZoomSize && (w / width) > maxZoomSize) {
      w = width * maxZoomSize
      h = height * maxZoomSize
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
      // 移动端缩放超过屏幕时缩放原点不在[0, 0]
      if (width > boxWidth && !isMobile) {
        left = 0
      } else {
        left = (boxWidth - width) / 2
      }
      if (height > boxHeight && !isMobile) {
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

  isInside ({ x, y }, box) {
    if (!box) {
      return false
    }
    const rect = box.getBoundingClientRect()
    const cX = x - document.body.offsetLeft
    const cY = y - document.body.offsetTop
    if (cX > rect.left && cX < rect.right && cY > rect.top && cY < rect.bottom) {
      return true
    }
    return false
  },

  isRotation (angle) {
    return angle % 180 !== 0
  },

  getZoomRatio (v, { zoomStep, minZoomSize, maxZoomSize }, out = false) {
    const n = parseInt(this.divide(v, zoomStep), 10)
    if (out) {
      // 缩小
      return Math.max(minZoomSize, (n - 1) * zoomStep)
    } else {
      // 放大
      return Math.min(maxZoomSize, this.multiple(n + 1, zoomStep))
    }
  },

  // 浮点计算精度问题
  multiple (a, b, precision = 3) {
    let sumDecimal = 0
    const aStr = a.toString()
    const bStr = b.toString()
    try {
      sumDecimal += aStr.split('.')[1].length
    } catch (f) {}
    try {
      sumDecimal += bStr.split('.')[1].length
    } catch (f) {}
    return Number(
      (Number(aStr.replace('.', '')) * Number(bStr.replace('.', '')) / Math.pow(10, sumDecimal)).toFixed(precision)
    )
  },

  divide (a, b, precision = 3) {
    let aDecimal = 0
    let bDecimal = 0
    try {
      aDecimal = a.toString().split('.')[1].length
    } catch (g) {}
    try {
      bDecimal = b.toString().split('.')[1].length
    } catch (g) {}
    const aInt = Number(a.toString().replace('.', ''))
    const bInt = Number(b.toString().replace('.', ''))
    return this.multiple(aInt / bInt, Math.pow(10, bDecimal - aDecimal), precision)
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
  },

  fixedBody () {
    if (!fixed) { // 避免重复设置造成Body原属性获取失败
      const { position, width, top } = document.body.style
      originPosition = position
      originWidth = width
      originTop = top
      const scrollTop = document.body.scrollTop || document.documentElement.scrollTop
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${scrollTop}px`
      fixed = true
    }
  },

  looseBody () {
    const body = document.body
    body.style.position = originPosition
    body.style.width = originWidth
    window.scrollTo(0, -parseInt(body.style.top || '0', 10));
    body.style.top = originTop;
    fixed = false;
  }
}
