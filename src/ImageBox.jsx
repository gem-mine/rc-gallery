import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Util, { isMac } from './util'
import ReactDOM from 'react-dom'

export default class extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    loading: PropTypes.bool,
    error: PropTypes.bool,
    top: PropTypes.number,
    left: PropTypes.number,
    rotate: PropTypes.number,
    src: PropTypes.string,
    spinClass: PropTypes.object,
    mouseZoomDirection: PropTypes.func,
    zoomStep: PropTypes.number,
    maxZoomSize: PropTypes.number,
    minZoomSize: PropTypes.number,
    onImageLoad: PropTypes.func,
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
    left: 0
  }
  // todo: mousewheel事件等放到这里绑定
  componentDidMount () {
    this.image = ReactDOM.findDOMNode(this.imageRef)
    if (this.props.mouseWheelZoom) {
      // 鼠标滚轮缩放事件
      Util.addEvent(this.image, 'mousewheel', this.handleWheel) //  for firefox
      Util.addEvent(this.image, 'wheel', this.handleWheel)
    }
  }

  // todo: 加载图片
  onLoad = e => {
    const { minZoomSize, maxZoomSize, src } = this.props
    const imageBox = this.imageBox
    const imageEle = e.target

    const { width, height, top, left } = Util.getPosition({
      width: imageEle.width,
      height: imageEle.height,
      minZoomSize,
      maxZoomSize
    }, imageBox)
    // const ratio = width / this.width
    this.imageWidth = imageEle.width
    this.imageHeight = imageEle.height
    this.setState({
      loading: false,
      error: false,
      rotate: 0,
      // disableZoomOut: ratio <= minZoomSize,
      // disableZoomIn: ratio >= maxZoomSize,
      // ratio,
      width,
      height,
      top,
      left,
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

  // todo： 错误处理
  onError = () => {
    console.log('发生错误')
  }

  handleZoom = (out = false) => {
    const { zoomStep, minZoomSize, maxZoomSize } = this.props
    const imageRect = this.imageRef.getBoundingClientRect()
    const ratio = imageRect.width / this.imageWidth
    if ((ratio >= minZoomSize && out) || (ratio <= maxZoomSize && !out)) {
      const r = Util.getZoomRatio(ratio, { zoomStep, minZoomSize, maxZoomSize }, out)
      const w = this.imageWidth * r
      const h = this.imageHeight * r
      this.imageRef.style.transform = `scale(${r})`
      this.setState({
        width: w,
        height: h,
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

  render () {
    const { prefixCls, spinClass, error, rotate, src } = this.props
    const { loading, top, left } = this.state
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
      const inline = { top, left, transform: `rotate(${rotate}deg)`, msTransform: `rotate(${rotate}deg)` }
      contentComponent = <img
        ref={node => { this.imageRef = node }}
        src={src}
        style={inline}
        onError={this.onError}
        onLoad={this.onLoad} />
    }
    return (
      <div ref={node => { this.imageBox = node }} className={`${prefixCls}-image`}>
        {contentComponent}
        {loadingComponent}
      </div>
    )
  }
}
