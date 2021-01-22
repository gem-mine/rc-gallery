import React, { Component } from 'react'
import Portal from 'rc-util/lib/PortalWrapper'
import Gallery from './Gallery'
import PropTypes from 'prop-types'

class GalleryWrapper extends Component {
  static propTypes = {
    displayMode: PropTypes.string, // 是否弹出全屏
    visible: PropTypes.bool,
    getPopupContainer: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element,
      PropTypes.func
    ]) // 指定挂载的 HTML 节点, false 为挂载在当前 dom
  }

  static defaultProps = {
    displayMode: 'modal'
  }

  render () {
    const {
      getPopupContainer,
      ...galleryProps
    } = this.props

    const { displayMode, visible } = this.props

    if (displayMode === 'modal' && visible !== undefined) {
      return (
        <Portal getContainer={getPopupContainer} visible={visible} >
          {() => (
            <Gallery {...galleryProps} />
          )}
        </Portal>
      )
    }

    // false： 挂载在当前dom节点
    if (!getPopupContainer) {
      return <Gallery {...galleryProps} />
    }

    return <Gallery {...galleryProps} />
  }
}

GalleryWrapper.displayName = 'Gallery'

export default GalleryWrapper
