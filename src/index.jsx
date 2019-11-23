import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Util from './util'
import Toolbar from './Toolbar'
import ImageBox from './ImageBox'
import Footer from './Footer'
import Thumbnail from './Thumbnail'
import throttle from 'lodash.throttle'
import classNames from 'classnames'
import Gesture from 'rc-gesture'

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
    spinClass: PropTypes.node,
    displayMode: PropTypes.string, // 是否弹出全屏
    mouseWheelZoom: PropTypes.bool, // 开启鼠标滚轮放大缩小
    mouseZoomDirection: PropTypes.func
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
    displayMode: 'modal'
  }

  imageBoxes = []

  state = {
    currentIndex: 1,
    loading: false,
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
    mouseWheelZoom: true,
    contentPos: `translate3d(0, 0, 0)` // 跳转到第几页对应的translateX位置
  }

  constructor (props) {
    super(props)
    // 无限滚动数据处理
    const images = props.images.slice(0)
    images.push(props.images[0])
    images.unshift(props.images[props.images.length - 1])
    this.state.images = images

    // 因为无限滚动修改了数据，默认从1开始
    let currentIndex = 1
    const startIndex = props.startIndex - 1 // 兼容以上无限滚动修改数据
    if (startIndex && startIndex >= 0 && startIndex <= props.images.length - 1) {
      currentIndex = startIndex
    }

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
      displayMode
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
    if (displayMode === 'modal') {
      this.addScrollingEffect()
    }
    this.updateThumbnailScroll(this.state.currentIndex)
    this.setState({ contentPos: `translate3d(${-this.state.currentIndex * window.innerWidth}px, 0, 0)` })
  }

  componentWillUnmount () {
    // 清除自动播放定时器
    if (this.intervalId) {
      window.clearInterval(this.intervalId)
    }
    if (this.props.displayMode === 'modal') {
      this.removeScrollingEffect()
    }
  }

  // 弹出框的滚动条处理
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
    const fullWindowWidth = window.innerWidth
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
    this.updateThumbnailScroll(this.state.currentIndex)
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
    if (index === this.state.currentIndex) {
      return
    }
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
        contentPos: `translate3d(${-nextIndex * this.layout.clientWidth}px, 0, 0)`,
        disableNext: index >= count && !this.props.infinite,
        disablePrev: index <= 0 && !this.props.infinite
      })
    }
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
        if (scroll === 0) {
          // resize的时候重新定位缩略图位置
          this.setThumbnailScroll(-(currentIndex * perIndexScroll))
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

  onSwipe = (status) => {
    if (!this.imageBoxes[this.state.currentIndex].canJumpTo) {
      return
    }
    if (status.direction === 2) {
      this.handleNext()
    } else if (status.direction === 4) {
      this.handlePrev()
    }
  }
  onPan = (() => {
    let lastOffset = -window.innerWidth
    let finalOffset = -window.innerWidth

    const getLastOffset = () => {
      return Number(lastOffset.toString().replace('px', ''))
    }

    return {
      onPanMove: (status) => {
        if (!this.imageBoxes[this.state.currentIndex].canJumpTo) {
          return
        }
        let offset = getLastOffset()
        offset += status.moveStatus.x

        this.transDuration = '0s'
        this.setState({ contentPos: `translate3d(${offset}px, 0px, 0px)` })
        finalOffset = offset
      },

      onPanEnd: () => {
        if (!this.imageBoxes[this.state.currentIndex].canJumpTo) {
          return
        }
        // 根据滑动的最后位置算出是在那一张图片
        let offsetIndex = this.getOffsetIndex(finalOffset, this.layout.clientWidth)

        if (offsetIndex <= 0) {
          offsetIndex = this.props.images.length
        } else if (offsetIndex === this.props.images.length) {
          offsetIndex = 0
        }
        lastOffset = finalOffset

        this.transDuration = '.3s'
        if (offsetIndex === this.state.currentIndex) {
          this.setState({ contentPos: this.getContentPosByIndex(offsetIndex) })
        } else {
          // this.setState({ currentIndex: offsetIndex })
          this.jumpTo(offsetIndex)
          lastOffset = -offsetIndex * window.innerWidth
        }
      },

      setCurrentOffset: (offset) => { lastOffset = offset }
    }
  })();

  getContentPosByIndex (index) {
    const value = `${-index * window.innerWidth}px`
    this.onPan.setCurrentOffset(value)

    const translate = `${value}`
    // fix: content overlay TabBar on iOS 10. ( 0px -> 1px )
    return `translate3d(${translate}, 0px, 0px)`
  }

  // threshold： 滑动多少距离触发切换到下一页
  getOffsetIndex = (current, width, threshold = 0.3) => {
    const ratio = Math.abs(current / width)
    const direction = ratio > this.state.currentIndex ? '<' : '>'
    const index = Math.floor(ratio)
    switch (direction) {
      case '<':
        return ratio - index > threshold ? index + 1 : index
      case '>':
        return 1 - ratio + index > threshold ? index - 1 : index
      default:
        return Math.round(ratio)
    }
  }
  render () {
    const {
      prefixCls,
      showThumbnail,
      images,
      closeIcon,
      prevIcon,
      nextIcon,
      showToolbar,
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

    // toolbar控制问题
    let toolbar = null
    if (showToolbar) {
      toolbar = (
        <Toolbar
          {...this.props}
          {...this.state}
          handleZoom={this.imageBoxes[this.state.currentIndex] ? this.imageBoxes[this.state.currentIndex].handleZoom : null}
          handleRotate={this.imageBoxes[this.state.currentIndex] ? this.imageBoxes[this.state.currentIndex].handleRotate : null}
          handleTogglePlay={this.handleTogglePlay} />
      )
    }
    let thumbnail = null
    if (images.length > 1 && showThumbnail) {
      thumbnail = (
        <Thumbnail
          currentIndex={this.state.currentIndex}
          showThumbnail={this.props.showThumbnail}
          thumbnailIcon={this.props.thumbnailIcon}
          spinClass={this.props.spinClass}
          prefixCls={prefixCls}
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
        <Gesture
          // onSwipe={this.onSwipe}
          {...this.onPan}
        >
          <div
            className={`${prefixCls}-content`}
            style={{
              bottom: (this.state.showThumbnail && images.length > 1) ? '100px' : '0'
            }}>
            <div
              ref={(node) => { this.layout = node }}
              style={{
                transform: this.state.contentPos,
                height: '100%',
                // transitionDuration: `${this.transDuration}`,
                display: 'flex',
                flexDirection: 'row' }}>
              {this.state.images.map((item, index) => {
                return (
                  <ImageBox
                    key={index}
                    src={item.original}
                    ref={node => { this.imageBoxes[index] = node }}
                    handleTogglePlay={this.handleTogglePlay}
                    play={this.play}
                    pause={this.pause}
                    prefixCls={prefixCls}
                    spinClass={this.props.spinClass}
                    mouseZoomDirection={this.props.mouseZoomDirection}
                    zoomStep={this.props.zoomStep}
                    maxZoomSize={this.props.maxZoomSize}
                    minZoomSize={this.props.minZoomSize}
                    onImageLoad={this.props.onImageLoad}
                    onImageLoadError={this.props.onImageLoadError} />
                )
              })}
            </div>
            <span onClick={this.handleClose} className={`${prefixCls}-close`}>
              {'closeIcon' in this.props ? closeIcon : <i className={`anticon anticon-close`} />}
            </span>
            {prev}
            {next}
            {toolbar}
            <Footer {...this.state} {...this.props} />
          </div>
        </Gesture>
        {thumbnail}
      </div>
    )
  }
}

export default Gallery
