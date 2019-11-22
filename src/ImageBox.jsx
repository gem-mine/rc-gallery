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
    src: PropTypes.string,
    currentSrc: PropTypes.string,
    spinClass: PropTypes.object,
    mouseZoomDirection: PropTypes.func,
    zoomStep: PropTypes.number,
    maxZoomSize: PropTypes.number,
    minZoomSize: PropTypes.number,
    onImageLoad: PropTypes.func,
    onImageLoadError: PropTypes.func,
    play: PropTypes.func,
    pause: PropTypes.func,
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
    top: '50%',
    left: '50%',
    translateX: '0',
    translateY: '0',
    ratio: 1
  }
  // todo: transform优化为一个函数
  // todo: ie9下无法拖拽
  // todo: 缩放拖拽后缩小时要居中
  componentDidMount () {
    this.image = ReactDOM.findDOMNode(this.imageRef)
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
    const { width } = Util.getPosition({
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
      ratio,
      translateX: (imageBox.offsetWidth - imageEle.offsetWidth) / 2 + 'px', // 居中 todo： 优化
      translateY: (imageBox.offsetHeight - imageEle.offsetHeight) / 2 + 'px',
      src
    })
    if (this.props.onImageLoad) {
      this.props.onImageLoad()
    }
  }

  handleWheel = (e) => {
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
    const ratio = imageRect.width / this.imageWidth
    if ((ratio >= minZoomSize && out) || (ratio <= maxZoomSize && !out)) {
      const r = Util.getZoomRatio(ratio, { zoomStep, minZoomSize, maxZoomSize }, out)
      console.log((this.imageRef.offsetWidth - this.imageBoxRef.offsetWidth) / 2, '|', parseInt(this.state.translateX))
      this.setState({
        ratio: r,
        translateX: (this.imageBoxRef.offsetWidth - this.imageRef.offsetWidth) / 2 + 'px', // 居中 todo： 优化 pc端的时候需要顶点为左上角
        translateY: (this.imageBoxRef.offsetHeight - this.imageRef.offsetHeight) / 2 + 'px'
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
        touchAction: 'none', // todo： 写到样式里
        visibility: loading ? 'hidden' : 'visible', // top,left为计算时会在左上角闪烁
        ...(getTransformPropValue(`translateX(${this.state.translateX}) translateY(${this.state.translateY}) scale(${this.state.ratio}) rotate(${this.state.rotate}deg)`))
      }
      contentComponent = <img
        ref={node => { this.imageRef = node }}
        src={src}
        onWheel={this.props.mouseWheelZoom ? this.handleWheel : null}
        onMouseOut={this.handleMouseOut} // 鼠标移入图片内时停止自动播放
        onMouseOver={this.handleMouseOver}
        onMouseDown={this.handleMoveStart} // 拖动图片移动（如果事件绑定在document上，在inline模式下阻止默认行为无法选中文本）
        onMouseMove={this.handleMove}
        onMouseUp={this.handleMoveEnd}
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
