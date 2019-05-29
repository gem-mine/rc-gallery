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
    customToolbarItem: PropTypes.func
  }
  thumbnailItemClass = () => {
    const props = this.props
    return classNames('anticon', {
      [`${props.prefixCls}-disable`]: props.error
    })
  }

  zoomIn = () => {
    const props = this.props
    const classes = classNames(
      this.thumbnailItemClass(),
      {
        [`anticon-plus-circle`]: true
      }
    )

    const disabled = props.error || props.loading || props.disableZoomIn
    return (
      <span onClick={disabled ? null : () => { props.handleZoom(false) }}>
        {props.zoomInIcon || <i className={classes} />}
      </span>
    )
  }

  zoomOut = () => {
    const props = this.props
    const classes = classNames(
      this.thumbnailItemClass(),
      {
        [`anticon-minus-circle`]: true
      }
    )
    const disabled = props.error || props.loading || props.disableZoomOut
    return (
      <span onClick={disabled ? null : () => { props.handleZoom(true) }}>
        {props.zoomOutIcon || <i className={classes} />}
      </span>
    )
  }

  rotateRight = () => {
    const props = this.props
    const classes = classNames(
      this.thumbnailItemClass(),
      {
        [`anticon-reload`]: true,
        [`flipx`]: true
      }
    )

    const disabled = props.error
    return (
      <span onClick={disabled ? null : () => { props.handleRotate(-90) }}>
        {props.rotateRightIcon || <i className={classes} />}
      </span>
    )
  }

  rotateLeft = () => {
    const props = this.props
    const classes = classNames(
      this.thumbnailItemClass(),
      {
        [`anticon-reload`]: true
      }
    )

    const disabled = props.error
    return (
      <span onClick={disabled ? null : () => { props.handleRotate(90) }}>
        {props.rotateLeftIcon || <i className={classes} />}
      </span>
    )
  }

  autoPlay = () => {
    const props = this.props
    const classes = classNames(
      this.thumbnailItemClass(),
      {
        [`anticon-pause`]: props.isPlaying,
        [`anticon-play-circle`]: !props.isPlaying
      }
    )

    let autoPlay = null
    // 图片数量小于1张的时候不显示自动播放
    if (props.images.length > 1) {
      const disabled = props.error
      const icon = props.isPlaying ? props.pauseIcon : props.playIcon
      autoPlay = (
        <span onClick={disabled ? null : () => { props.handleTogglePlay(false) }}>
          {icon || <i className={classes} />}
        </span>
      )
    }
    return autoPlay
  }

  classicItems = () => {
    // 生成toolbar操作项目数组
    return Object.keys(this.props.toolbarConfig).filter((value) => {
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
