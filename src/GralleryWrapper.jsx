import React, { Component } from 'react'
import Portal from 'rc-util/lib/PortalWrapper'
import Gallery from './Gallery'
import PropTypes from 'prop-types'

class GalleryWrapper extends Component {
  static propTypes = {
    displayMode: PropTypes.string, // 是否弹出全屏
    visible: PropTypes.bool,
    getContainer: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element,
      PropTypes.func,
      PropTypes.bool
    ]) // 指定挂载的 HTML 节点, false 为挂载在当前 dom
  }

  static defaultProps = {
    displayMode: 'modal',
    getContainer: 'body'
  }

  render () {
    const {
      getContainer,
      ...galleryProps
    } = this.props

    const { displayMode, visible } = this.props

    let gallery = <Gallery {...galleryProps} />

    // false 渲染在当前dom节点
    if (!getContainer) {
      gallery = visible ? <Gallery {...galleryProps} /> : null
    }

    // 'modal'模式 使用visible控制显隐
    if (displayMode === 'modal' && visible !== undefined && getContainer) {
      gallery = visible ? (
        <Portal getContainer={getContainer} visible={visible} >
          {() => (
            <Gallery {...galleryProps} />
          )}
        </Portal>
      ) : null
    }

    return gallery
  }
}

GalleryWrapper.displayName = 'Gallery'

export default GalleryWrapper
