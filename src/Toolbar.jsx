import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

class Toolbar extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    src: PropTypes.string,
    toolbarConfig: PropTypes.object,
    currentIndex: PropTypes.number,
    images: PropTypes.array,
    customToolbarItem: PropTypes.func,
    handleRotate: PropTypes.func,
    handleTogglePlay: PropTypes.func,
    handleZoom: PropTypes.func,
    zoomInIcon: PropTypes.object,
    zoomOutIcon: PropTypes.object,
    rotateLeftIcon: PropTypes.object,
    rotateRightIcon: PropTypes.object,
    pauseIcon: PropTypes.object,
    playIcon: PropTypes.object,
    loading: PropTypes.bool,
    error: PropTypes.bool,
    disableZoomIn: PropTypes.bool,
    disableZoomOut: PropTypes.bool,
    isPlaying: PropTypes.bool
  }
  thumbnailItemClass = () => {
    const props = this.props
    return classNames('anticon', {
      [`${props.prefixCls}-disable`]: props.error
    })
  }

  zoomIn = () => {
    const props = this.props
    const { zoomInIcon, error, loading, disableZoomIn } = this.props
    const classes = classNames(
      this.thumbnailItemClass(),
      {
        [`anticon-plus-circle`]: true
      }
    )

    const disabled = error || loading || disableZoomIn
    return (
      <span onClick={disabled ? null : () => { props.handleZoom(false) }}>
        {zoomInIcon || <i className={classes} />}
      </span>
    )
  }

  zoomOut = () => {
    const props = this.props
    const { zoomOutIcon, error, loading, disableZoomOut } = this.props
    const classes = classNames(
      this.thumbnailItemClass(),
      {
        [`anticon-minus-circle`]: true
      }
    )
    const disabled = error || loading || disableZoomOut
    return (
      <span onClick={disabled ? null : () => { props.handleZoom(true) }}>
        {zoomOutIcon || <i className={classes} />}
      </span>
    )
  }

  rotateRight = () => {
    const { rotateRightIcon, error, handleRotate } = this.props
    const classes = classNames(
      this.thumbnailItemClass(),
      {
        [`anticon-reload`]: true,
        [`flipx`]: true
      }
    )

    const disabled = error
    return (
      <span onClick={disabled ? null : () => { handleRotate(-90) }}>
        {rotateRightIcon || <i className={classes} />}
      </span>
    )
  }

  rotateLeft = () => {
    const { error, handleRotate, rotateLeftIcon } = this.props
    const classes = classNames(
      this.thumbnailItemClass(),
      {
        [`anticon-reload`]: true
      }
    )

    const disabled = error
    return (
      <span onClick={disabled ? null : () => { handleRotate(90) }}>
        {rotateLeftIcon || <i className={classes} />}
      </span>
    )
  }

  autoPlay = () => {
    const { error, isPlaying, handleTogglePlay, pauseIcon, playIcon } = this.props
    const classes = classNames(
      this.thumbnailItemClass(),
      {
        [`anticon-pause`]: isPlaying,
        [`anticon-play-circle`]: !isPlaying
      }
    )

    const disabled = error
    const icon = isPlaying ? pauseIcon : playIcon
    return (
      <span onClick={disabled ? null : () => { handleTogglePlay(false) }}>
        {icon || <i className={classes} />}
      </span>
    )
  }

  classicItems = () => {
    // 生成toolbar操作项目数组
    return Object.keys(this.props.toolbarConfig).filter((value) => {
      // 图片数量小于1张的时候不显示自动播放
      if (this.props.images.length === 1 && value === 'autoPlay') {
        return false
      }
      return this[value]
    }).map((value) => {
      return this[value]()
    })
  }

  render () {
    const { prefixCls, src, currentIndex, images, customToolbarItem } = this.props
    const items = this.classicItems()
    return (
      <div className={`${prefixCls}-toolbar`}>
        <div className={`${prefixCls}-toolbar-box`}>
          {items.map((item, index) => <span className={`${prefixCls}-toolbar-item`} key={index}>{item}</span>)}
          <span>{customToolbarItem({ images, src, currentIndex })}</span>
        </div>
      </div>
    )
  }
}

export default Toolbar
