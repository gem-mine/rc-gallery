import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default class extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    src: PropTypes.string,
    currentIndex: PropTypes.number,
    index: PropTypes.number,
    handleThumbnailItemClick: PropTypes.func,
    spinClass: PropTypes.object
  }
  static defaultProps = {
    prefixCls: 'fish-gallery',
    src: '',
    currentIndex: 0,
    index: 0
  }
  state = {
    loading: true,
    error: false
  }
  componentDidMount () {
    this.loadImage(this.props.src)
  }
  loadImage = src => {
    const img = new window.Image()
    const that = this
    img.onload = function () {
      that.setState({
        loading: false,
        error: false
      })
    }
    img.onerror = () => {
      this.setState({
        loading: false,
        error: true
      })
    }
    img.src = src
  }
  render () {
    const { loading, error } = this.state
    const { prefixCls, src, spinClass, currentIndex, index, handleThumbnailItemClick } = this.props

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
          <span className={`${prefixCls}-tip ${prefixCls}-thumbnail-item-error`}>载入图片失败</span>
        )
      }
    } else {
      contentComponent = <img className={`${prefixCls}-thumbnail-item-image`} src={src} />
    }
    const classString = classNames({
      [`${prefixCls}-thumbnail-item`]: true,
      current: currentIndex === index
    })

    return (
      <div className={classString} style={{ position: 'relative' }} onClick={() => { handleThumbnailItemClick(index) }}>
        {contentComponent}
        {loadingComponent}
      </div>
    )
  }
}
