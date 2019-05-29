import React, { Component } from 'react'
import ThumbnailItem from './ThumbnailItem'
import classNames from 'classnames'

class Thumbnail extends Component {
  render () {
    const props = this.props
    const thumbnailItems = []
    props.images.map((v, index) => {
      thumbnailItems.push(
        <ThumbnailItem {...props} src={v.thumbnail || v.original} key={index} index={index} />
      )
    })
    const classes = classNames({
      [`${props.prefixCls}-thumbnail-switch`]: true,
      [`${props.prefixCls}-thumbnail-switch-close`]: !props.showThumbnail
    })
    return (
      <div className={`${props.prefixCls}-thumbnail`} ref={node => { this.thumbnailWrapper = node }} style={{ ...props.style }}>
        <div
          className={`${classes}`}
          onClick={() => { props.handleShowThumbnail(!props.showThumbnail) }} >
          <span>
            {props.thumbnailIcon || <i className={`anticon anticon-caret-down`} />}
          </span>
        </div>
        <div className={`${props.prefixCls}-thumbnail-content`}
          ref={node => { this.thumbnail = node }}
          style={{ left: props.thumbnailScroll, transition: `left ${props.thumbnailScrollDuration}ms` }}>
          {thumbnailItems}
        </div>
      </div>
    )
  }
}

export default Thumbnail
