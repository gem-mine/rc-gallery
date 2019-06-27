import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import Util from './util'
import Toolbar from './Toolbar'
import ImageBox from './ImageBox'
import Footer from './Footer'
import Thumbnail from './Thumbnail'
import throttle from 'lodash.throttle'
import classNames from 'classnames'

class Gallery extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    startIndex: PropTypes.number,
    playSpeed: PropTypes.number,
    autoPlay: PropTypes.bool,
    showToolbar: PropTypes.bool,
    toolbarConfig: PropTypes.object,
    images: PropTypes.array,
    infinite: PropTypes.bool,
    showThumbnail: PropTypes.bool,
    keymap: PropTypes.bool,
    src: PropTypes.string,
    onClose: PropTypes.func,
    onMovePrev: PropTypes.func,
    onMoveNext: PropTypes.func,
    onThumbnailClick: PropTypes.func,
    onImageLoad: PropTypes.func,
    onImageLoadError: PropTypes.func,
    customToolbarItem: PropTypes.func,
    zoomStep: PropTypes.number,
    maxZoomSize: PropTypes.number,
    minZoomSize: PropTypes.number,
    closeIcon: PropTypes.node,
    thumbnailIcon: PropTypes.node,
    prevIcon: PropTypes.node,
    nextIcon: PropTypes.node,
    displayMode: PropTypes.string, // 是否弹出全屏
    mouseWheelZoom: PropTypes.bool // 开启鼠标滚轮放大缩小
  }
  static defaultProps = {
    prefixCls: 'fish-gallery',
    images: [
      {
        original: '',
        thumbnail: '',
        description: null
      }
    ],
    src: undefined,
    showToolbar: true,
    toolbarConfig: {
      autoPlay: true,
      rotateLeft: true,
      rotateRight: true,
      zoomIn: true,
      zoomOut: true
    },
    keymap: true,
    infinite: false,
    startIndex: 0,
    autoPlay: false,
    playSpeed: 2000,
    showThumbnail: true,
    zoomStep: 0.2,
    maxZoomSize: 3,
    minZoomSize: 0.2,
    customToolbarItem: () => {},
    displayMode: 'modal',
    mouseWheelZoom: true
  }

  state = {
    currentIndex: 0,
    src: undefined,
    loading: true,
    error: false,
    width: 0,
    height: 0,
    rotate: 0,
    ratio: 1,
    top: 0,
    left: 0,
    disableZoomIn: false,
    disableZoomOut: false,
    disableNext: true,
    disablePrev: true,
    isPlaying: false, // 是否在播放状态 控制toolbar图标
    thumbnailScroll: 0, // 缩略图的位置
    showThumbnail: true, // 是否显示缩略图
    mouseWheelZoom: true
  }

  constructor (props) {
    super(props)

    let currentIndex = 0
    if (props.startIndex && props.startIndex >= 0 && props.startIndex <= props.images.length - 1) {
      currentIndex = props.startIndex
    }

    let src = props.src
    props.images.some((v, i) => {
      if (v.original === src) {
        currentIndex = i
        return true
      }
    })
    src = props.images[currentIndex].original
    this.state.src = src
    this.state.showThumbnail = props.showThumbnail

    this.state.currentIndex = currentIndex
    this.state.disableNext = !props.infinite && currentIndex >= props.images.length - 1
    this.state.disablePrev = !props.infinite && currentIndex <= 0

    this.handleResize = throttle(this.handleResize, 100)
  }

  componentDidMount () {
    const {
      showThumbnail,
      autoPlay,
      keymap,
      displayMode,
      mouseWheelZoom
    } = this.props

    Util.addEvent(window, 'resize', this.handleResize)

    if (showThumbnail) {
      this.handleShowThumbnail(showThumbnail)
    }
    if (autoPlay) {
      this.play()
    }
    if (keymap) {
      Util.addEvent(document.body, 'keyup', this.handleKeyUp)
    }

    this.imageBox = ReactDOM.findDOMNode(this.imageBoxRef)
    if (this.imageBoxRef.imageRef) {
      this.image = ReactDOM.findDOMNode(this.imageBoxRef.imageRef)
      // 鼠标移入图片内时停止自动播放
      Util.addEvent(this.image, 'mouseover', this.handleMouseOver)
      Util.addEvent(this.image, 'mouseout', this.handleMouseOut)

      // 拖动图片移动（如果事件绑定在document上，在inline模式下阻止默认行为无法选中文本）
      Util.addEvent(this.image, 'mousedown', this.handleMoveStart)
      Util.addEvent(this.image, 'mousemove', this.handleMove)
      Util.addEvent(this.image, 'mouseup', this.handleMoveEnd)

      if (mouseWheelZoom) {
        // 鼠标滚轮缩放事件
        Util.addEvent(this.image, 'mousewheel', this.handleWheel) //  for firefox
        Util.addEvent(this.image, 'wheel', this.handleWheel)
      }
    }
    if (displayMode === 'modal') {
      this.addScrollingEffect()
    }
    this.updateThumbnailScroll()
    this.loadImage(this.state.src)
  }

  componentWillUnmount () {
    const { mouseWheelZoom } = this.props

    Util.removeEvent(window, 'resize', this.handleResize)

    // Util.removeEvent(document, 'mousewheel', this.handleWheel)
    Util.removeEvent(document, 'wheel', this.handleWheel)
    if (this.props.keymap) {
      Util.removeEvent(document.body, 'keyup', this.handleKeyUp)
    }
    if (this.imageBoxRef.imageRef) {
      this.image = ReactDOM.findDOMNode(this.imageBoxRef.imageRef)
      Util.removeEvent(this.image, 'mouseover', this.handleMouseOver)
      Util.removeEvent(this.image, 'mouseover', this.handleMouseOut)

      Util.removeEvent(this.image, 'mousedown', this.handleMoveStart)
      Util.removeEvent(this.image, 'mousemove', this.handleMove)
      Util.removeEvent(this.image, 'mouseup', this.handleMoveEnd)

      if (mouseWheelZoom) {
        Util.removeEvent(this.image, 'mousewheel', this.handleWheel) //  for firefox
        Util.removeEvent(this.image, 'wheel', this.handleWheel)
      }
    }
    // 清除自动播放定时器
    if (this.intervalId) {
      window.clearInterval(this.intervalId)
    }
    if (this.props.displayMode === 'modal') {
      this.removeScrollingEffect()
    }
  }

  addScrollingEffect = () => {
    this.checkScrollbar()
    this.setScrollbar()
    document.body.style.overflow = 'hidden'
  }

  removeScrollingEffect = () => {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }

  checkScrollbar = () => {
    let fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      const documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    if (this.bodyIsOverflowing) {
      this.scrollbarWidth = Util.getScrollBarSize()
    }
  }

  setScrollbar = () => {
    if (this.bodyIsOverflowing && this.scrollbarWidth !== undefined) {
      document.body.style.paddingRight = `${this.scrollbarWidth}px`
    }
  }

  handleClose = e => {
    Util.stopDefault(e)
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  handleKeyUp = e => {
    const leftArrow = 37
    const rightArrow = 39
    const escKey = 27

    switch (e.keyCode) {
      case escKey:
        this.props.onClose()
        break
      case leftArrow:
        if (this.canSlideLeft()) {
          this.handlePrev()
        }
        break
      case rightArrow:
        this.handleNext()
        break
    }
  }

  handleResize = () => {
    if (!this.state.error) {
      const { width, height, rotate } = this.state
      const box = this.imageBox
      const { top, left } = Util.getZoomOffset({ width, height }, box, Util.isRotation(rotate))
      this.setState({
        top,
        left
      })
    }
    this.updateThumbnailScroll()
  }

  handleWheel = e => {
    // inline模式的时候阻止页面滚动
    e.preventDefault()
    if (!this.state.error) {
      const box = this.imageBoxRef.imageRef || null
      if (Util.isInside(e, box) && e.deltaY !== 0) {
        // todo: 这里有个问题，就是实际初始化的size可能不是1，这时候设置min和max size的问题
        this.handleZoom(e.deltaY < 0)
      }
    }
  }

  handleNext = () => {
    const currentIndex = this.state.currentIndex + 1
    this.jumpTo(this.state.currentIndex + 1)
    if (this.props.onMoveNext) {
      this.props.onMoveNext(currentIndex)
    }
  }

  handlePrev = () => {
    const currentIndex = this.state.currentIndex - 1
    this.jumpTo(currentIndex)
    if (this.props.onMovePrev) {
      this.props.onMovePrev(currentIndex)
    }
  }

  jumpTo = (index) => {
    const count = this.props.images.length - 1

    let nextIndex = index
    if (index < 0) {
      nextIndex = count
    } else if (index > count) {
      nextIndex = 0
    }
    if (nextIndex !== this.state.currentIndex) {
      this.setState({
        currentIndex: nextIndex,
        loading: true,
        disableNext: index >= count && !this.props.infinite,
        disablePrev: index <= 0 && !this.props.infinite
      })
      this.loadImage(this.props.images[nextIndex].original)
    }
  }

  handleMoveStart = e => {
    Util.stopDefault(e)
    const event = e || window.event
    const box = this.imageBox
    const target = event.target || event.srcElement
    if (!Util.isInside(event, box)) {
      return
    }
    if (!target || target.tagName.toUpperCase() !== 'IMG') {
      return
    }
    this.point = [event.pageX || event.clientX, event.pageY || event.clientX]
    this.boxWidth = box.offsetWidth
    this.boxHeight = box.offsetHeight
  }

  handleMoveEnd = e => {
    Util.stopDefault(e)
    this.point = null
  }

  handleMove = e => {
    Util.stopDefault(e)
    if (!this.point) {
      return
    }
    const event = e || window.event
    const state = this.state
    let x, y
    x = (event.pageX || event.clientX) - this.point[0]
    y = (event.pageY || event.clientY) - this.point[1]
    this.point = [event.pageX || event.clientX, event.pageY || event.clientY]

    const left = state.left + x
    const top = state.top + y
    const { width, height } = state
    if (Util.isRotation(state.rotate)) {
      if (left >= (height - width) / 2 || left <= this.boxWidth - (height + width) / 2) {
        x = 0
      }
      if (top >= (width - height) / 2 || top <= this.boxHeight - (width + height) / 2) {
        y = 0
      }
    } else {
      if (left >= 0 || left <= this.boxWidth - state.width) {
        x = 0
      }
      if (top >= 0 || top <= this.boxHeight - state.height) {
        y = 0
      }
    }

    this.setState({
      top: state.top + y,
      left: state.left + x
    })
  }

  handleMouseOver = () => {
    const { isPlaying } = this.state
    this.isPlayingBefore = isPlaying
    if (isPlaying) {
      this.pause()
    }
  }

  handleMouseOut = () => {
    this.point = null // inline模式时鼠标图片拖拽鼠标移动到图片外问题
    if (this.isPlayingBefore) {
      this.play()
    }
  }
  loadImage = src => {
    const img = new window.Image()
    const that = this
    const { minZoomSize, maxZoomSize } = this.props
    img.onload = function () {
      const box = that.imageBox
      const { width, height, top, left } = Util.getPosition({ width: this.width, height: this.height }, box)
      const ratio = width / this.width
      that.imageWidth = this.width
      that.imageHeight = this.height
      that.setState({
        loading: false,
        error: false,
        rotate: 0,
        disableZoomOut: ratio <= minZoomSize,
        disableZoomIn: ratio >= maxZoomSize,
        ratio,
        width,
        height,
        top,
        left,
        src
      })
      if (that.props.onImageLoad) {
        that.props.onImageLoad()
      }
    }
    img.onerror = () => {
      this.setState({
        loading: false,
        error: true,
        src
      })
      if (that.props.onImageLoadError) {
        that.props.onImageLoadError()
      }
    }
    img.src = src // ie8不触发onLoad问题
  }

  handleZoom = (out = false) => {
    const { width, rotate } = this.state
    const { zoomStep, minZoomSize, maxZoomSize } = this.props
    const ratio = width / this.imageWidth
    if ((ratio >= minZoomSize && out) || (ratio <= maxZoomSize && !out)) {
      const r = Util.getZoomRatio(ratio, { zoomStep, minZoomSize, maxZoomSize }, out)
      const w = this.imageWidth * r
      const h = this.imageHeight * r
      const box = this.imageBox
      const offset = Util.getZoomOffset({ width: w, height: h }, box, Util.isRotation(rotate))
      this.setState({
        width: w,
        height: h,
        top: offset.top,
        left: offset.left,
        disableZoomOut: r <= minZoomSize,
        disableZoomIn: r >= maxZoomSize,
        ratio: r
      })
    } else {
      if (out) {
        this.setState({
          disableZoomOut: true
        })
      } else {
        this.setState({
          disableZoomIn: true
        })
      }
    }
  }

  handleRotate = angle => {
    const rotate = this.state.rotate + angle
    const box = this.imageBox
    const { top, left } = Util.getZoomOffset(
      { width: this.state.width, height: this.state.height },
      box,
      Util.isRotation(rotate)
    )
    this.setState({
      rotate,
      top,
      left
    })
  }

  canSlideLeft () {
    return this.props.infinite || this.state.currentIndex > 0
  }

  canSlideRight () {
    return this.props.infinite ||
      this.state.currentIndex < this.props.images.length - 1
  }

  play () {
    if (!this.intervalId) {
      const { playSpeed } = this.props
      this.setState({ isPlaying: true })

      this.intervalId = window.setInterval(() => {
        if (!this.canSlideRight()) {
          this.pause()
        } else {
          this.handleNext()
        }
      }, playSpeed)
    }
  }

  pause () {
    if (this.intervalId) {
      window.clearInterval(this.intervalId)
      this.intervalId = null
      this.setState({ isPlaying: false })
    }
  }

  handleTogglePlay = () => {
    if (this.intervalId) {
      this.pause()
    } else {
      this.play()
    }
  }

  // 开启关闭缩略图
  handleShowThumbnail = (showThumbnail) => {
    this.setState({ showThumbnail })
  }

  handleThumbnailItemClick = (index) => {
    this.jumpTo(index)
    if (this.props.onThumbnailClick) {
      this.props.onThumbnailClick(index)
    }
  }

  updateThumbnailScroll (prevIndex) {
    if (this.thumbnailComponent) {
      const { thumbnailScroll, currentIndex } = this.state
      const thumbWidth = this.thumbnailComponent.thumbnail.scrollWidth
      const thumbWrapperWidth = this.thumbnailComponent.thumbnailWrapper.offsetWidth

      if (thumbWidth <= thumbWrapperWidth || thumbWrapperWidth <= 0) {
        this.thumbnailScrollDuration = 0
        this.setThumbnailScroll((thumbWrapperWidth - thumbWidth) / 2)
      } else {
        this.thumbnailScrollDuration = 500
        const indexDiff = Math.abs(prevIndex - currentIndex)
        const totalScroll = thumbWidth - thumbWrapperWidth
        const totalThumbnails = this.thumbnailComponent.thumbnail.children.length
        const perIndexScroll = totalScroll / (totalThumbnails - 1)
        const scroll = indexDiff * perIndexScroll
        if (scroll > 0) {
          if (prevIndex < currentIndex) {
            this.setThumbnailScroll(thumbnailScroll - scroll)
          } else if (prevIndex > currentIndex) {
            this.setThumbnailScroll(thumbnailScroll + scroll)
          }
        }
      }
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.currentIndex !== this.state.currentIndex) {
      this.updateThumbnailScroll(prevState.currentIndex)
    }
    // 开关缩略图时重新定位
    if (prevState.showThumbnail !== this.state.showThumbnail) {
      this.handleResize()
    }
  }

  // 设置缩略图的滚动
  setThumbnailScroll (thumbnailScroll) {
    this.setState({ thumbnailScroll })
  }

  render () {
    const {
      prefixCls,
      showToolbar,
      showThumbnail,
      images,
      closeIcon,
      prevIcon,
      nextIcon,
      displayMode
    } = this.props

    let prev = null
    let next = null
    if (images.length > 1) {
      const { disablePrev, disableNext } = this.state
      const prevClass = classNames({
        [`${prefixCls}-prev`]: true,
        [`${prefixCls}-disable`]: disablePrev
      })
      prev = (
        <div className={prevClass} onClick={disablePrev ? null : this.handlePrev}>
          { prevIcon || <i className="anticon anticon-left" /> }
        </div>
      )

      const nextClass = classNames({
        [`${prefixCls}-next`]: true,
        [`${prefixCls}-disable`]: disableNext
      })
      next = (
        <div className={nextClass} onClick={disableNext ? null : this.handleNext}>
          { nextIcon || <i className="anticon anticon-right" /> }
        </div>
      )
    }

    let toolbar = null
    if (showToolbar) {
      toolbar = (
        <Toolbar
          {...this.props}
          {...this.state}
          handleZoom={this.handleZoom}
          handleRotate={this.handleRotate}
          handleTogglePlay={this.handleTogglePlay} />
      )
    }

    let thumbnail = null
    if (images.length > 1 && showThumbnail) {
      thumbnail = (
        <Thumbnail
          {...this.props}
          {...this.state}
          style={{ height: this.state.showThumbnail ? '100px' : '0' }}
          ref={node => { this.thumbnailComponent = node }}
          images={this.props.images}
          handleThumbnailItemClick={this.handleThumbnailItemClick}
          handleShowThumbnail={this.handleShowThumbnail}
          thumbnailScroll={this.state.thumbnailScroll}
          thumbnailScrollDuration={this.thumbnailScrollDuration} />
      )
    }

    return (
      <div className={classNames(prefixCls, {
        [`${prefixCls}-inline`]: displayMode === 'inline'
      })}>
        <div
          className={`${prefixCls}-content`}
          style={{ bottom: (this.state.showThumbnail && images.length > 1) ? '100px' : '0' }}>
          <ImageBox ref={(node) => { this.imageBoxRef = node }} {...this.props} {...this.state} />
          <span onClick={this.handleClose} className={`${prefixCls}-close`}>
            {'closeIcon' in this.props ? closeIcon : <i className={`anticon anticon-close`} />}
          </span>
          {toolbar}
          {prev}
          {next}
          <Footer {...this.props} {...this.state} />
        </div>
        {thumbnail}
      </div>
    )
  }
}

export default Gallery
