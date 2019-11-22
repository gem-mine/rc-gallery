import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Util, { isMac, getTransformPropValue } from './util'
import ReactDOM from 'react-dom'
import Toolbar from './Toolbar'

export default class extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    error: PropTypes.bool,
    showToolbar: PropTypes.bool,
    rotate: PropTypes.number,
    src: PropTypes.string,
    spinClass: PropTypes.object,
    mouseZoomDirection: PropTypes.func,
    zoomStep: PropTypes.number,
    maxZoomSize: PropTypes.number,
    minZoomSize: PropTypes.number,
    onImageLoad: PropTypes.func,
    onImageLoadError: PropTypes.func,
    play: PropTypes.func,
    pause: PropTypes.func,
    handleTogglePlay: PropTypes.func,
    mouseWheelZoom: PropTypes.bool // 开启鼠标滚轮放大缩小
  }
  static defaultProps = {
    prefixCls: 'fish-gallery',
    loading: true,
    error: false,
    zoomStep: 0.2,
    maxZoomSize: 3,
    minZoomSize: 0.2,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    rotate: 0,
    src: '',
    mouseZoomDirection: (e) => {
      // 根据系统，win下滚轮向上放大，向下缩小；mac下相反
      return isMac ? e.deltaY < 0 : e.deltaY > 0
    }
  }

  state = {
    error: false,
    loading: true,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    translateX: '-50%',
    translateY: '-50%',
    ratio: 1
  }
  // todo: transform优化为一个函数
  // todo: ie9下无法拖拽
  // todo: 缩放拖拽后缩小时要居中
  // todo: 懒加载能力
  componentDidMount () {
    this.image = ReactDOM.findDOMNode(this.imageRef)
    if (this.image) {
      if (this.props.mouseWheelZoom) {
        // 鼠标滚轮缩放事件
        Util.addEvent(this.image, 'mousewheel', this.handleWheel) //  for firefox
        Util.addEvent(this.image, 'wheel', this.handleWheel)
      }
      // 鼠标移入图片内时停止自动播放
      Util.addEvent(this.image, 'mouseover', this.handleMouseOver)
      Util.addEvent(this.image, 'mouseout', this.handleMouseOut)

      // 拖动图片移动（如果事件绑定在document上，在inline模式下阻止默认行为无法选中文本）
      Util.addEvent(this.image, 'mousedown', this.handleMoveStart)
      Util.addEvent(this.image, 'mousemove', this.handleMove)
      Util.addEvent(this.image, 'mouseup', this.handleMoveEnd)
    }
    const { currentSrc, src } = this.props
    if (currentSrc === src) {
      this.setState({ src: currentSrc })
    }
  }

  handleMoveStart = e => {
    e.preventDefault()
    const { button, target } = e
    if (button !== 0) {
      return
    }
    if (!target || target.tagName.toUpperCase() !== 'IMG') {
      return
    }
    this.point = [e.pageX || e.clientX, e.pageY || e.clientX]
    const box = this.imageBoxRef
    this.imageBoxWidth = box.offsetWidth
    this.imageBoxHeight = box.offsetHeight
  }
  // todo: 根据缩放程度判断拖拽范围
  handleMove = (e) => {
    e.preventDefault()
    if (!this.point) {
      return
    }
    let xDelta = e.pageX - this.point[0]
    let yDelta = e.pageY - this.point[1]

    this.point = [e.pageX, e.pageY]
    const [x = 0, y = 0] = Util.getComputedTranslateXY(this.imageRef)

    // 没有旋转的情况
    const { left, top, right, bottom } = this.imageRef.getBoundingClientRect()
    const { width: boxWidth, height: boxHeight } = this.imageBoxRef.getBoundingClientRect()
    if ((left + xDelta >= 0) || (right + xDelta <= boxWidth)) {
      xDelta = 0
    }
    if ((top + yDelta >= 0) || (bottom + yDelta <= boxHeight)) {
      yDelta = 0
    }
    // todo: 有旋转的情况

    this.setState({
      translateX: `${x + xDelta}px`,
      translateY: `${y + yDelta}px`
    })
  }

  handleMoveEnd = () => {
    this.point = null
  }

  handleMouseOver = () => {
    const { isPlaying } = this.state
    this.isPlayingBefore = isPlaying
    if (isPlaying) {
      this.props.pause()
    }
  }

  handleMouseOut = () => {
    this.point = null // inline模式时鼠标图片拖拽鼠标移动到图片外问题
    if (this.isPlayingBefore) {
      this.props.play()
    }
  }

  onLoad = e => {
    const { minZoomSize, maxZoomSize, src } = this.props
    const imageBox = this.imageBoxRef
    const imageEle = this.imageRef
    const { width, height, top, left } = Util.getPosition({
      width: imageEle.width,
      height: imageEle.height,
      minZoomSize,
      maxZoomSize
    }, imageBox)
    const ratio = width / imageEle.width
    this.imageWidth = imageEle.width
    this.imageHeight = imageEle.height
    this.setState({
      loading: false,
      error: false,
      rotate: 0,
      // disableZoomOut: ratio <= minZoomSize,
      // disableZoomIn: ratio >= maxZoomSize,
      ratio,
      // width,
      // height,
      // top,
      // left,
      src
    })
    if (this.props.onImageLoad) {
      this.props.onImageLoad()
    }
  }

  // todo: 控制缩放
  handleWheel = (e) => {
    e.preventDefault()
    const { mouseZoomDirection } = this.props
    if (!this.state.error) {
      this.handleZoom(mouseZoomDirection(e))
    }
  }

  onError = () => {
    this.setState({
      loading: false,
      error: true
    })
    if (this.props.onImageLoadError) {
      this.props.onImageLoadError()
    }
  }

  handleRotate = angle => {
    const rotate = this.state.rotate + angle
    this.setState({ rotate })
  }

  handleZoom = (out = false) => {
    const { zoomStep, minZoomSize, maxZoomSize } = this.props
    const imageRect = this.imageRef.getBoundingClientRect()
    const imageBoxRect = this.imageBoxRef.getBoundingClientRect()
    const ratio = imageRect.width / this.imageWidth
    if ((ratio >= minZoomSize && out) || (ratio <= maxZoomSize && !out)) {
      const r = Util.getZoomRatio(ratio, { zoomStep, minZoomSize, maxZoomSize }, out)
      // const offset = Util.getZoomOffset({ width: w, height: h }, this.imageBoxRef, Util.isRotation(this.state.rotate))
      // 如果图片的宽度大于容器的宽度，那么translateX 图片left距离左边框的距离
      // todo：如果宽度大于box宽度，需要居中   看下handleMove
      const [x = 0, y = 0] = Util.getComputedTranslateXY(this.imageRef)
      this.setState({
        // top: offset.top,
        // left: offset.left,
        // translateX: (imageRect.width * r > imageBoxRect.width) ? `${-imageRect.left}px` : this.state.translateX,
        // translateY: imageRect.height > imageBoxRect.height ? `${-imageRect.top}px` : 0,
        translateX: x + 'px',
        translateY: y + 'px',
        // disableZoomOut: r <= minZoomSize,
        // disableZoomIn: r >= maxZoomSize,
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

  // todo: 懒加载优化
  componentDidUpdate (prevProps) {
    if (prevProps.currentIndex !== this.props.currentIndex) {
      if (this.props.index === this.props.currentIndex) {
        this.setState({ src: this.props.images[this.props.currentIndex].original })
      }
    }
  }

  render () {
    const { prefixCls, spinClass, error, showToolbar } = this.props
    const { loading, top, left, src } = this.state
    let loadingComponent = null
    let contentComponent = null

    if (loading) {
      if (spinClass) {
        loadingComponent = spinClass
      } else {
        loadingComponent = (
          <span className={`${prefixCls}-tip ${prefixCls}-image-spin`} />
        )
      }
    }

    if (error) {
      if (!loading) {
        contentComponent = (
          <span className={`${prefixCls}-tip ${prefixCls}-image-error`}>载入图片失败</span>
        )
      }
    } else {
      const inline = {
        visibility: loading ? 'hidden' : 'visible', // top,left为计算时会在左上角闪烁
        top: '50%',
        left: '50%',
        ...(getTransformPropValue(`translateX(${this.state.translateX}) translateY(${this.state.translateY}) scale(${this.state.ratio}) rotate(${this.state.rotate}deg)`))
      }
      contentComponent = <img
        ref={node => { this.imageRef = node }}
        src={src}
        style={inline}
        onError={this.onError}
        onLoad={this.onLoad} />
    }

    return (
      <div ref={node => { this.imageBoxRef = node }} className={`${prefixCls}-image`}>
        {loadingComponent}
        {contentComponent}
      </div>
    )
  }
}
