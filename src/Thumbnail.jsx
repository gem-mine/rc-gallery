import React, { Component } from 'react'
import ThumbnailItem from './ThumbnailItem'
import classNames from 'classnames'
import PropTypes from 'prop-types'

class Thumbnail extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    images: PropTypes.array,
    handleShowThumbnail: PropTypes.func,
    showThumbnail: PropTypes.bool,
    thumbnailScrollDuration: PropTypes.number,
    thumbnailIcon: PropTypes.node,
    thumbnailScroll: PropTypes.number,
    style: PropTypes.object,
    handleThumbnailItemClick: PropTypes.func,
    currentIndex: PropTypes.number
  }
  render () {
    const {
      images,
      prefixCls,
      handleShowThumbnail,
      showThumbnail,
      thumbnailScrollDuration,
      thumbnailIcon,
      thumbnailScroll,
      currentIndex,
      style
    } = this.props
    const thumbnailItems = []
    images.map((v, index) => {
      thumbnailItems.push(
        <ThumbnailItem
          prefixCls={prefixCls}
          src={v.thumbnail || v.original}
          index={index}
          key={index}
          currentIndex={currentIndex}
          handleThumbnailItemClick={this.props.handleThumbnailItemClick}
        />
      )
    })
    const classes = classNames({
      [`${prefixCls}-thumbnail-switch`]: true,
      [`${prefixCls}-thumbnail-switch-close`]: !showThumbnail
    })
    return (
      <div className={`${prefixCls}-thumbnail`} ref={node => { this.thumbnailWrapper = node }} style={{ ...style }}>
        <div
          className={`${classes}`}
          onClick={() => { handleShowThumbnail(!showThumbnail) }} >
          <span>
            {thumbnailIcon || <i className={`anticon anticon-caret-down`} />}
          </span>
        </div>
        <div
          className={`${prefixCls}-thumbnail-content`}
          ref={node => { this.thumbnail = node }}
          style={{ left: thumbnailScroll, transition: `left ${thumbnailScrollDuration}ms` }}>
          {thumbnailItems}
        </div>
      </div>
    )
  }
}

export default Thumbnail
