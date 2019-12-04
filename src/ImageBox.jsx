import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Util, { isMac, isMobile, getTransformComp } from './util'
import Gesture from 'rc-gesture'
import throttle from 'lodash.throttle'

export default class extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
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
    setImageBox: PropTypes.func,
    setImageStatus: PropTypes.func,
    currentIndex: PropTypes.number,
    index: PropTypes.number,
    setSwiping: PropTypes.func,
    showThumbnail: PropTypes.bool,
    isMobile: PropTypes.bool,
    isPlaying: PropTypes.bool,
    mouseWheelZoom: PropTypes.bool // 开启鼠标滚轮放大缩小
  }
  static defaultProps = {
    prefixCls: 'fish-gallery',
    zoomStep: 0.2,
    maxZoomSize: 3,
    minZoomSize: 0.2,
    src: '',
    mouseWheelZoom: true,
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
    translateX: '0',
    translateY: '0',
    rotate: 0,
    ratio: 1
  }

  transition = 'none'

  constructor (props) {
    super(props)
    this.handleResize = throttle(this.initImage, 300)
  }

  componentDidMount () {
    Util.addEvent(window, 'resize', this.handleResize)
    // inline模式的时候阻止页面滚动 直接绑在元素上无效
    Util.addEvent(this.imageRef, 'wheel', Util.stopDefault)
  }

  componentWillUnmount () {
    Util.removeEvent(window, 'resize', this.handleResize)
    Util.removeEvent(this.imageRef, 'wheel', Util.stopDefault)
  }

  handleMoveStart = e => {
    if (isMobile) {
      const { srcEvent, moveStatus } = e
      if (!srcEvent) {
        return
      }
      srcEvent.preventDefault()
      const { x, y } = moveStatus
      this.point = [x, y]
    } else {
      e.preventDefault()
      const { button, target } = e
      if (button !== 0) {
        return
      }
      if (!target || target.tagName.toUpperCase() !== 'IMG') {
        return
      }
      this.point = [e.pageX || e.clientX, e.pageY || e.clientX]
    }
  }

  handleMove = (e) => {
    let xDelta = 0
    let yDelta = 0
    if (isMobile) {
      const { srcEvent, moveStatus } = e
      if (!srcEvent) {
        return
      }
      srcEvent.preventDefault()
      if (!this.point) {
        return
      }
      xDelta = moveStatus.x - this.point[0]
      yDelta = moveStatus.y - this.point[1]
      this.point = [moveStatus.x, moveStatus.y]
    } else {
      e.preventDefault()
      if (!this.point) {
        return
      }
      xDelta = e.pageX - this.point[0]
      yDelta = e.pageY - this.point[1]

      this.point = [e.pageX, e.pageY]
    }
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
    this.setState({
      translateX: `${x + xDelta}px`,
      translateY: `${y + yDelta}px`
    })
  }

  handleMoveEnd = () => {
    this.point = null
  }

  handleMouseOver = () => {
    const { isPlaying } = this.props
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

  onLoad = () => {
    this.initImage()
    if (this.props.onImageLoad) {
      this.props.onImageLoad()
    }
  }

  initImage = () => {
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
    this.initRatio = ratio
    this.imageWidth = imageEle.width
    this.imageHeight = imageEle.height
    this.setState({
      loading: false,
      error: false,
      rotate: 0,
      ratio,
      translateX: `${(imageBox.offsetWidth - imageEle.offsetWidth) / 2}px`,
      translateY: `${(imageBox.offsetHeight - imageEle.offsetHeight) / 2}px`,
      src
    }, () => {
      if (this.props.currentIndex === this.props.index) {
        this.props.setImageBox(this)
        this.props.setImageStatus({ loading: false, error: false, ratio: this.state.ratio })
      }
    })
  }

  handleWheel = e => {
    const { mouseZoomDirection } = this.props
    if (!this.state.error) {
      this.handleZoom(mouseZoomDirection(e))
    }
  }

  onError = () => {
    this.setState({
      loading: false,
      error: true
    }, () => {
      this.props.setImageStatus({ loading: true, error: false })
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
    const { zoomStep, minZoomSize, maxZoomSize, setImageStatus } = this.props
    const imageRect = this.imageRef.getBoundingClientRect()
    const ratio = imageRect.width / (Util.isRotation(this.state.rotate) ? this.imageHeight : this.imageWidth)
    if ((ratio >= minZoomSize && out) || (ratio <= maxZoomSize && !out)) {
      const r = Util.getZoomRatio(ratio, { zoomStep, minZoomSize, maxZoomSize }, out)
      this.props.setSwiping && this.props.setSwiping(r <= this.initRatio)

      this.setState({
        ratio: r,
        translateX: (this.imageBoxRef.offsetWidth - this.imageRef.offsetWidth) / 2 + 'px', // 居中 todo： 优化 pc端的时候需要顶点为左上角
        translateY: (this.imageBoxRef.offsetHeight - this.imageRef.offsetHeight) / 2 + 'px'
      }, () => {
        setImageStatus({ ratio: r })
      })
    } else {
      if (out) {
        this.setState({
          disableZoomOut: true
        }, () => {
          setImageStatus({ disableZoomOut: true })
        })
      } else {
        this.setState({
          disableZoomIn: true
        }, () => {
          setImageStatus({ disableZoomIn: true })
        })
      }
    }
  }

  handleMobileZoom = (e) => {
    const { scale: ratio } = e
    const { minZoomSize, maxZoomSize, setImageStatus } = this.props
    const r = ratio * this.cacheRatio
    if (r >= minZoomSize && r <= maxZoomSize) {
      this.props.setSwiping && this.props.setSwiping(r <= this.initRatio)
      this.setState({
        ratio: r,
        translateX: `${(this.imageBoxRef.offsetWidth - this.imageRef.offsetWidth) / 2}px`,
        translateY: `${(this.imageBoxRef.offsetHeight - this.imageRef.offsetHeight) / 2}px`
      }, () => {
        setImageStatus({ ratio: r })
      })
    } else {
      const disableZoomOut = r <= minZoomSize
      const disableZoomIn = r >= maxZoomSize
      this.setState({
        disableZoomOut,
        disableZoomIn
      }, () => {
        setImageStatus({
          disableZoomOut,
          disableZoomIn
        })
      })
    }
  }

  // todo: 懒加载优化
  componentDidUpdate (prevProps) {
    if (prevProps.src !== this.props.src) {
      this.setState({ loading: true }, () => {
        this.props.setImageStatus({ loading: true })
      })
    }
    if (prevProps.currentIndex !== this.props.currentIndex || prevProps.showThumbnail !== this.props.showThumbnail) {
      this.initImage()
      this.transition = 'all .3s'
      setTimeout(() => {
        this.transition = 'none'
      }, 300)
    }
  }

  render () {
    const { prefixCls, spinClass } = this.props
    const { loading, error } = this.state
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
        transition: this.props.isMobile ? this.transition : 'none',
        // ie9 不支持translate3d 使用如下形式
        ...(getTransformComp(
          `translateX(${this.state.translateX}) translateY(${this.state.translateY}) scale(${this.state.ratio}) rotate(${this.state.rotate}deg)`))
      }
      contentComponent = <img
        ref={node => { this.imageRef = node }}
        src={this.props.src}
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
      <Gesture
        enablePinch
        onPinchStart={() => {
          this.cacheRatio = this.state.ratio
        }}
        onPinchIn={this.handleMobileZoom}
        onPinchOut={this.handleMobileZoom}
        onPanStart={this.handleMoveStart}
        onPanMove={this.handleMove}>
        <div
          style={this.props.isMobile ? {
            height: '100vh',
            width: '100vw'
          } : {}}
          ref={node => { this.imageBoxRef = node }}
          className={`${prefixCls}-image`}>
          {loadingComponent}
          {contentComponent}
        </div>
      </Gesture>
    )
  }
}
