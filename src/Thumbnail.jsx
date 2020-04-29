import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ThumbnailItem from './ThumbnailItem'
import classNames from 'classnames'

class Thumbnail extends Component {
  static propTypes = {
    images: PropTypes.array,
    prefixCls: PropTypes.string,
    style: PropTypes.object,
    showThumbnail: PropTypes.bool,
    direction: PropTypes.string,
    thumbnailScroll: PropTypes.number,
    thumbnailScrollDuration: PropTypes.number,
    handleShowThumbnail: PropTypes.func,
    thumbnailIcon: PropTypes.object
  }
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
    let thumbContentStyle = {}
    if (props.direction === 'rtl') {
      thumbContentStyle = { right: props.thumbnailScroll, transition: `right ${props.thumbnailScrollDuration}ms` }
    } else {
      thumbContentStyle = { left: props.thumbnailScroll, transition: `left ${props.thumbnailScrollDuration}ms` }
    }
    return (
      <div className={`${props.prefixCls}-thumbnail`} ref={node => { this.thumbnailWrapper = node }} style={{ ...props.style }}>
        <div
          className={`${classes}`}
          onClick={() => { props.handleShowThumbnail(!props.showThumbnail) }} >
          <span>
            {props.thumbnailIcon || <i className={`anticon anticon-caret-down`} />}
          </span>
        </div>
        <div
          className={classNames(`${props.prefixCls}-thumbnail-content`, {
            [`${props.prefixCls}-rtl`]: props.direction === 'rtl'
          })}
          ref={node => { this.thumbnail = node }}
          style={{ ...thumbContentStyle }}>
          {thumbnailItems}
        </div>
      </div>
    )
  }
}

export default Thumbnail
