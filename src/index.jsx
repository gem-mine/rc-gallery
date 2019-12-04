import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Util, { isMobile } from './util'
import Toolbar from './Toolbar'
import ImageBox from './ImageBox'
import Footer from './Footer'
import Thumbnail from './Thumbnail'
import throttle from 'lodash.throttle'
import classNames from 'classnames'
import ReactCarousel from 'rmc-nuka-carousel'

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
    zoomInIcon: PropTypes.object,
    zoomOutIcon: PropTypes.object,
    rotateLeftIcon: PropTypes.object,
    rotateRightIcon: PropTypes.object,
    pauseIcon: PropTypes.object,
    playIcon: PropTypes.object,
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
    showToolbar: !isMobile,
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
    showThumbnail: !isMobile,
    customToolbarItem: () => {},
    displayMode: 'modal'
  }

  imageBoxes = []

  // demo 页iframe中根据浏览器头判断的还是移动端，增加一个属性强改为移动端模式
  isMobile = isMobile || this.props.displayMode === 'mobile'

  state = {
    currentIndex: 0,
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
    mouseWheelZoom: true
  }

  constructor (props) {
    super(props)

    let currentIndex = 0
    if (props.startIndex && props.startIndex >= 0 && props.startIndex <= props.images.length - 1) {
      currentIndex = props.startIndex
    }

    let src = ''
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
    // 初始化的时候imageBox的ref还没有
    this.updateThumbnailScroll(this.state.currentIndex)
  }

  componentWillUnmount () {
    // 清除自动播放定时器
    if (this.intervalId) {
      window.clearInterval(this.intervalId)
    }
    if (this.props.keymap) {
      Util.removeEvent(document.body, 'keyup', this.handleKeyUp)
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
    this.updateThumbnailScroll(this.state.currentIndex)
  }

  handleNext = () => {
    const currentIndex = this.state.currentIndex + 1
    this.jumpTo(this.state.currentIndex + 1)
    if (this.props.onMoveNext) {
      this.props.onMoveNext(currentIndex)
    }
  }

  setImageBox = (ref) => {
    this.imageBox = ref
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

  play = () => {
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

  pause = () => {
    if (this.intervalId) {
      window.clearInterval(this.intervalId)
      this.intervalId = null
      this.setState({ isPlaying: false })
    }
  }

  handleTogglePlay = () => {
    if (this.state.isPlaying) {
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

  setSwiping = swiping => {
    this.setState({ swiping })
  }

  setImageStatus = ({ ...status }) => {
    this.setState({ ...status })
  }

  renderImageBox = () => {
    const {
      images,
      infinite,
      showThumbnail,
      playSpeed,
      prefixCls
    } = this.props
    const {
      currentIndex,
      swiping,
      isPlaying
    } = this.state
    // 只有1张的时候，ReactCarousel会给ImageBox加height: auto导致撑不起来
    if (this.isMobile && images.length !== 1) {
      return (
        <ReactCarousel
          wrapAround={infinite}
          decorators={[]}
          withoutControls
          dragging={swiping}
          slideIndex={currentIndex}
          swiping={swiping}
          autoplay={this.props.autoPlay || this.state.autoPlay}
          autoplayInterval={playSpeed}
          afterSlide={this.handleAfterSlide}>
          {images.map((item, index) => {
            return this.renderImageBoxItem(item, index)
          })}
        </ReactCarousel>
      )
    } else {
      return (
        <ImageBox
          play={this.play}
          pause={this.pause}
          prefixCls={prefixCls}
          isPlaying={isPlaying}
          setImageBox={this.setImageBox}
          setImageStatus={this.setImageStatus}
          showThumbnail={showThumbnail}
          src={images[this.state.currentIndex].original} />
      )
    }
  }

  renderImageBoxItem = (imageObj, index) => {
    const {
      prefixCls,
      spinClass,
      mouseZoomDirection,
      maxZoomSize,
      minZoomSize,
      onImageLoad,
      zoomStep,
      onImageLoadError
    } = this.props
    const { currentIndex } = this.state
    return (
      <ImageBox
        key={index}
        index={index}
        src={imageObj.original}
        setSwiping={this.isMobile ? this.setSwiping : null}
        setImageBox={this.setImageBox}
        setImageStatus={this.setImageStatus}
        handleTogglePlay={this.handleTogglePlay}
        play={this.play}
        pause={this.pause}
        isMobile={this.isMobile}
        prefixCls={prefixCls}
        spinClass={spinClass}
        mouseZoomDirection={mouseZoomDirection}
        zoomStep={zoomStep}
        maxZoomSize={maxZoomSize}
        minZoomSize={minZoomSize}
        onImageLoad={onImageLoad}
        currentIndex={currentIndex}
        onImageLoadError={onImageLoadError} />
    )
  }

  renderToolbar = () => {
    const {
      showToolbar,
      prefixCls,
      images,
      customToolbarItem,
      zoomInIcon,
      zoomOutIcon,
      rotateLeftIcon,
      rotateRightIcon,
      pauseIcon,
      playIcon,
      toolbarConfig
    } = this.props
    const {
      currentIndex,
      src,
      isPlaying,
      loading,
      error,
      disableZoomIn,
      disableZoomOut
    } = this.state
    if (!showToolbar) {
      return
    }
    let handleZoom = null
    let handleRotate = null
    if (this.imageBox) {
      handleZoom = this.imageBox.handleZoom
      handleRotate = this.imageBox.handleRotate
    }

    return (
      <Toolbar
        prefixCls={prefixCls}
        src={src}
        toolbarConfig={toolbarConfig}
        currentIndex={currentIndex}
        images={images}
        isPlaying={isPlaying}
        customToolbarItem={customToolbarItem}
        handleZoom={handleZoom}
        handleRotate={handleRotate}
        loading={loading}
        error={error}
        zoomInIcon={zoomInIcon}
        zoomOutIcon={zoomOutIcon}
        rotateLeftIcon={rotateLeftIcon}
        rotateRightIcon={rotateRightIcon}
        pauseIcon={pauseIcon}
        playIcon={playIcon}
        disableZoomIn={disableZoomIn}
        disableZoomOut={disableZoomOut}
        handleTogglePlay={this.handleTogglePlay} />
    )
  }

  renderThumbnail = () => {
    const {
      prefixCls,
      images,
      showThumbnail: renderThumbnail,
      thumbnailIcon,
      spinClass
    } = this.props
    const {
      currentIndex,
      thumbnailScroll,
      showThumbnail
    } = this.state

    if (this.isMobile) {
      return null
    }
    if (images.length > 1 && renderThumbnail) {
      return (
        <Thumbnail
          currentIndex={currentIndex}
          showThumbnail={showThumbnail}
          thumbnailIcon={thumbnailIcon}
          spinClass={spinClass}
          prefixCls={prefixCls}
          style={{ height: showThumbnail ? '100px' : '0' }}
          ref={node => { this.thumbnailComponent = node }}
          images={images}
          handleThumbnailItemClick={this.handleThumbnailItemClick}
          handleShowThumbnail={this.handleShowThumbnail}
          thumbnailScroll={thumbnailScroll}
          thumbnailScrollDuration={this.thumbnailScrollDuration} />
      )
    }
  }

  renderPrevNext = () => {
    const {
      images,
      prefixCls,
      prevIcon,
      nextIcon
    } = this.props
    const {
      disablePrev,
      disableNext
    } = this.state
    if (images.length > 1 && !this.isMobile) {
      const prevClass = classNames({
        [`${prefixCls}-prev`]: true,
        [`${prefixCls}-disable`]: disablePrev
      })
      const nextClass = classNames({
        [`${prefixCls}-next`]: true,
        [`${prefixCls}-disable`]: disableNext
      })
      return [
        <div key="prev" className={prevClass} onClick={disablePrev ? null : this.handlePrev}>
          { prevIcon || <i className="anticon anticon-left" /> }
        </div>,
        <div key="next" className={nextClass} onClick={disableNext ? null : this.handleNext}>
          { nextIcon || <i className="anticon anticon-right" /> }
        </div>
      ]
    }
  }

  handleAfterSlide = index => {
    const {
      infinite,
      images,
      onMovePrev,
      onMoveNext
    } = this.props
    const { autoPlay, currentIndex } = this.state
    // 播放到最后一张暂停
    if (!infinite && autoPlay && index === images.length - 1) {
      this.pause()
    }
    if (index === currentIndex + 1 && onMoveNext) {
      onMoveNext(index)
    }
    if (index === currentIndex - 1 && onMovePrev) {
      onMovePrev(index)
    }
    this.setState({ currentIndex: index })
  }

  render () {
    const {
      prefixCls,
      images,
      closeIcon,
      displayMode
    } = this.props
    const {
      showThumbnail
    } = this.state

    const prevNext = this.renderPrevNext()

    const toolbar = this.renderToolbar()

    const thumbnail = this.renderThumbnail()

    const imageBoxes = this.renderImageBox()

    return (
      <div className={classNames(prefixCls, {
        [`${prefixCls}-inline`]: displayMode === 'inline'
      })}>
        <div
          className={`${prefixCls}-content`}
          style={{
            bottom: (showThumbnail && images.length > 1) ? '100px' : '0'
          }}>
          {imageBoxes}
          <span onClick={this.handleClose} className={`${prefixCls}-close`}>
            {'closeIcon' in this.props ? closeIcon : <i className={`anticon anticon-close`} />}
          </span>
          {prevNext}
          {toolbar}
          <Footer {...this.state} {...this.props} />
        </div>
        {thumbnail}
      </div>
    )
  }
}

export default Gallery
