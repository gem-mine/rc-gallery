# react图片查看器组件

---

图片查看器

## 何时使用

- 查看图片的时候

## 浏览器支持

IE 9+

## 安装

```bash
npm install rc-gallery --save
```

## 运行

```bash
# 默认开启服务器，地址为 ：http://localhost:8000/

# 能在ie9+下浏览本站，修改代码后自动重新构建，且能在ie10+运行热更新，页面会自动刷新
npm run start

# 构建生产环境静态文件，用于发布文档
npm run site
```

## 代码演示

在线示例：https://gem-mine.github.io/rc-gallery/site/

### 基本

基本用法。


```jsx
import "rc-gallery/lib/style/";
import Gallery from 'rc-gallery'

const images = [
      {
        original: '//iph.href.lu/800x600?text=0',
        thumbnail: '//iph.href.lu/800x600?text=0',
        description: <div>图片描述</div>
      },
      {
        original: '//iph.href.lu/800x600?text=1&bg=9df',
        thumbnail: '//iph.href.lu/800x600?text=1&bg=9df',
        description: <div style={{overflowY: 'scroll', maxHeight: '100px'}}>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/></div>
      },
      {
        original: '//iph.href.lu/800x600?text=2&bg=abc',
        thumbnail: '//iph.href.lu/800x600?text=2&bg=abc'
      }
    ]

class App extends React.Component {
  state = {
    isGallery: false,
  }
  openGallery = () => {
    this.setState({
      isGallery: true
    })
  }
  closeGallery = () => {
    this.setState({
      isGallery: false
    })
  }
  render() {
    let gallery = null
    if (this.state.isGallery) {
      gallery = (
        <Gallery
          zoomStep={0.4}
          images={images}
          infinite
          spinClass={<div className={`demo-custom-spin`}>loading...</div>}
          onClose={this.closeGallery} />
      )
    }
    return (
      <div>
       {gallery}
       <button onClick={this.openGallery}>查看图片</button>
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```

```css
.fish-gallery-image img {
  max-width: none;
}
.demo-custom-spin {
  font-size: 20px;
  color: #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

## API

| 参数        | 说明                                                | 类型        | 默认值 |
|----------- |---------------------------------------------------------  | ---------- |-------|
| displayMode | 显示模式, 有全屏遮罩模式和插入文档流模式        | Enum{ 'inline', 'modal' }  |  `modal`  |
| images | 数组对象，存放图片信息 | [Gallery.images[]](#images) | 无 |
| showToolbar | 是否显示工具条 | boolean | true |
| showThumbnail | 是否显示缩略图 | boolean | true |
| keymap | 是否开启默认键盘事件（esc关闭，左右选图片） | boolean | true |
| startIndex | 初始进入显示第几张图 | number | 0 |
| toolbarConfig | 配置工具栏 | object | toolbarConfig: { autoPlay: true, rotateLeft: true, rotateRight: true, zoomIn: true, zoomOut: true } |
| playSpeed | 自动播放速度(单位毫秒) | number | 2000 |
| infinite | 是否无限循环 | boolean | false |
| spinClass | 传入spin组件，替代自带的spin图 | react.element | 无 |
| customToolbarItem(images: object[], src: string, currentIndex: number) | 自定义toolbar；参数images是传入的图片数组，参数src是当前图片的原图地址，currentIndex是当前图片的索引 | function | () => {} |
| onClose | 关闭回调 | function | 无 |
| onMovePrev(currentIndex: Number) | 点击上一页回调，参数为当前图片索引 | function | 无 |
| onMoveNext(currentIndex: Number) | 点击下一页回调，参数为当前图片索引 | function | 无 |
| onThumbnailClick(index: Number)  | 点击缩略图回调，参数为缩略图表示的图片索引 | function | 无 |
| onImageLoad | 图片加载完成回调 | function | 无 |
| onImageLoadError | 图片加载失败回调 | function | 无 |
| closeIcon | 自定义关闭图标 | ReactNode | 无 |
| thumbnailIcon | 自定义开关缩略图图标 | ReactNode | 无 |
| prevIcon | 自定义上一页图标 | ReactNode | 无 |
| nextIcon | 自定义下一页图标 | ReactNode | 无 |
| maxZoomSize	| 最大可缩放比例 |	number	| 3 |
| minZoomSize |	最小可缩放比例	| number	| 0.2 |
| mouseWheelZoom | 开启鼠标滚轮放大缩小	| boolean	| true |
| mouseZoomDirection | 自定义鼠标滚轮控制缩放的方向，参数为滚轮事件对象。返回`true`图片缩小，返回`false`图片放大，默认win下滚轮向上放大，向下缩小；mac下相反	| (e) => boolean	| `isMac ? e.deltaY < 0 : e.deltaY > 0` |
| zoomInIcon  | 自定义放大图标 | ReactNode | 无 |
| zoomOutIcon | 自定义缩小图标 | ReactNode | 无 |
| rotateRightIcon | 自定义右转图标 | ReactNode | 无 |
| rotateLeftIcon | 自定义左转图标 | ReactNode | 无 |
| playIcon     | 自定义播放图标 | ReactNode | 无 |
| pauseIcon    | 自定义暂停图标 | ReactNode | 无 |

### images

配置每张图片信息，配置项如下

| 参数        | 说明                                       |     类型        | 默认值 |
|----------- |---------------------------------------------------------  | ---------- |-------|
| original   | 图片的原图地址                              |      string      | 无     |
| thumbnail   | 图片的缩略图地址，若未配置，则使用原图       |     string      | 无     |
| description   | 图片的描述                               |     react.element \| string      | 无     |
