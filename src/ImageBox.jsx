import React, { Component } from 'react'
import PropTypes from 'prop-types'

const IS_IE8 = navigator.appName === 'Microsoft Internet Explorer' && navigator.appVersion.split(';')[1].replace(/[ ]/g, '') === 'MSIE8.0'

// 注意, 此组件在外使用到 ref, 因此必须从 Component 继承方式, 否则拿不到 dom 节点
export default class extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    loading: PropTypes.bool,
    error: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number,
    top: PropTypes.number,
    left: PropTypes.number,
    rotate: PropTypes.number,
    src: PropTypes.string,
    spinClass: PropTypes.object
  }
  static defaultProps = {
    prefixCls: 'fish-gallery',
    loading: true,
    error: false,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    rotate: 0,
    src: ''
  }
  render () {
    const { prefixCls, loading, spinClass, error, width, height, top, left, rotate, src } = this.props
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
          <span className={`${prefixCls}-tip ${prefixCls}-image-error`}>载入图片失败</span>
        )
      }
    } else {
      const inline = { width, height, top, left, transform: `rotate(${rotate}deg)`, msTransform: `rotate(${rotate}deg)` }

      if (IS_IE8) {
        const radians = parseInt(rotate) * Math.PI * 2 / 360
        const costheta = Math.cos(radians)
        const sintheta = Math.sin(radians)
        const negsintheta = sintheta * -1
        inline.filter = `progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand', M11=${costheta}, M12=${negsintheta}, M21=${sintheta}, M22=${costheta})`

        // ie8旋转原点问题
        if ((rotate / 90 % 2) !== 0) {
          inline.top = inline.top + ((height - width) / 2)
          inline.left = inline.left + ((width - height) / 2)
        }
      }

      contentComponent = <img ref={node => { this.imageRef = node }} src={src} style={inline} />
    }
    return (
      <div className={`${prefixCls}-image`}>
        {contentComponent}
        {loadingComponent}
      </div>
    )
  }
}
