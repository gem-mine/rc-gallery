/**
 * 底部栏, 用于显示图片位置与总数
 */
import React from 'react'
import PropTypes from 'prop-types'

const Footer = props => {
  const ratio = parseInt(props.ratio * 100, 10) + '%'
  let zoom
  if (!props.error) {
    zoom = <div className={`${props.prefixCls}-footer-zoom`}>{ratio}</div>
  }

  let index = null
  if (props.images.length > 1) {
    index = (
      <div className={`${props.prefixCls}-footer-index`}>
        <span className={`${props.prefixCls}-footer-current`}>{props.currentIndex + 1}</span>
        <span className={`${props.prefixCls}-footer-split`}>/</span>
        <span className={`${props.prefixCls}-footer-total`}>{props.images.length}</span>
      </div>
    )
  }
  return (
    <div className={`${props.prefixCls}-footer`}>
      <div className={`${props.prefixCls}-description`}>{props.images[props.currentIndex].description}</div>
      <div className={`${props.prefixCls}-footer-info`}>
        {zoom}
        {index}
      </div>
    </div>
  )
}

Footer.propTypes = {
  prefixCls: PropTypes.string,
  currentIndex: PropTypes.number,
  images: PropTypes.array,
  ratio: PropTypes.number,
  error: PropTypes.bool
}

export default Footer
