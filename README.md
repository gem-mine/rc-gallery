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

const imageOriginal = [
      {
        original: '//img.zmei.me/gm/a801236bjw1ez812gy3g8j20rs0rs0z5.jpg',
        thumbnail: '//img.zmei.me/gm/a801236bjw1ez812gy3g8j20rs0rs0z5-thumb.jpg',
        description: <div>图片描述</div>
      },
      {
        original: '//img.zmei.me/gm/26828021367384226.jpg',
        thumbnail: '//img.zmei.me/gm/26828021367384226-thumb.jpg',
        description: <div style={{overflowY: 'scroll', maxHeight: '100px'}}>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/></div>
      },
      {
        original: '//img.zmei.me/gm/priview.jpg',
        thumbnail: '//img.zmei.me/gm/priview-thumb.jpg'
      },
      {
        original: '//img.zmei.me/gm/lazyimg1.jpg',
        thumbnail: '//img.zmei.me/gm/lazyimg1-thumb.jpg',
      },
      {
        original: '//img.zmei.me/gm/lazyimg2.jpg',
        thumbnail: '//img.zmei.me/gm/lazyimg2-thumb.jpg'
      }
    ]
const images = [...imageOriginal, ...imageOriginal, ...imageOriginal, ...imageOriginal]

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
          maxZoomSize={1}
          minZoomSize={1}
          zoomStep={0.4}
          images={images}
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

### 事件回调

事件发生时触发回调

```jsx
import "rc-gallery/lib/style/";
import Gallery from 'rc-gallery'

const imageOriginal = [
      {
        original: '//img.zmei.me/gm/a801236bjw1ez812gy3g8j20rs0rs0z5.jpg',
        thumbnail: '//img.zmei.me/gm/a801236bjw1ez812gy3g8j20rs0rs0z5-thumb.jpg',
        description: <div>图片描述</div>
      },
      {
        original: '//img.zmei.me/gm/26828021367384226.jpg',
        thumbnail: '//img.zmei.me/gm/26828021367384226-thumb.jpg',
        description: '图片描述的文字描述'
      },
      {
        original: '//img.zmei.me/gm/priview.jpg',
        thumbnail: '//img.zmei.me/gm/priview-thumb.jpg'
      },
      {
        original: '//img.zmei.me/gm/lazyimg1.jpg',
        thumbnail: '//img.zmei.me/gm/lazyimg1-thumb.jpg',
      },
      {
        original: '//img.zmei.me/gm/lazyimg2.jpg',
        thumbnail: '//img.zmei.me/gm/lazyimg2-thumb.jpg'
      }
    ]
const images = [...imageOriginal, ...imageOriginal, ...imageOriginal, ...imageOriginal]

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
  hanldeMovePrev = (currentIndex) => {
    console.log(`onMovePrev 图片索引：${currentIndex}`)
  }
  hanldeMoveNext = (currentIndex) => {
    console.log(`onMoveNext 图片索引：${currentIndex}`)
  }
  handleThumbnailClick = (index) => {
    console.log(`onMoveNext 图片索引：${index}`)
  }
  handleImageLoad = () => {
    console.log('图片加载成功')
  }
  handleImageLoadError = () => {
    console.log('图片加载失败')
  }
  render() {
    let gallery = null
    if (this.state.isGallery) {
      gallery = (
        <Gallery
          images={images}
          onClose={this.closeGallery}
          onMovePrev={this.hanldeMovePrev}
          onMoveNext={this.hanldeMoveNext}
          onThumbnailClick={this.handleThumbnailClick}
          onImageLoad={this.handleImageLoad}
          onImageLoadError={this.handleImageLoadError} />
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

### 自动播放

自动播放图片数组中的图片

```jsx
import "rc-gallery/lib/style/";
import Gallery from 'rc-gallery'

const images = [
      {
        original: '//img.zmei.me/gm/a801236bjw1ez812gy3g8j20rs0rs0z5.jpg',
        thumbnail: '//img.zmei.me/gm/a801236bjw1ez812gy3g8j20rs0rs0z5-thumb.jpg',
        description: <div>图片描述</div>
      },
      {
        original: '//img.zmei.me/gm/26828021367384226.jpg',
        thumbnail: '//img.zmei.me/gm/26828021367384226-thumb.jpg'
      },
      {
        original: '//img.zmei.me/gm/priview.jpg',
        thumbnail: '//img.zmei.me/gm/priview-thumb.jpg'
      },
      {
        original: '//img.zmei.me/gm/lazyimg1.jpg',
        thumbnail: '//img.zmei.me/gm/lazyimg1-thumb.jpg',
      },
      {
        original: '//img.zmei.me/gm/lazyimg2.jpg',
        thumbnail: '//img.zmei.me/gm/lazyimg2-thumb.jpg'
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
          images={images}
          infinite={true}
          autoPlay={true}
          showThumbnail={false}
          keymap={false}
          playSpeed={4000}
          onClose={this.closeGallery} />
      )
    }
    return (
      <div>
       {gallery}
       <button onClick={this.openGallery}>显示照片</button>
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```


### 配置工具栏

自定义工具栏


```jsx
import "rc-gallery/lib/style/";
import Gallery from 'rc-gallery'

const images = [
      {
        original: '//img.zmei.me/gm/a801236bjw1ez812gy3g8j20rs0rs0z5.jpg',
        thumbnail: '//img.zmei.me/gm/a801236bjw1ez812gy3g8j20rs0rs0z5-thumb.jpg',
        description: <div>图片描述</div>
      },
      {
        original: '//img.zmei.me/gm/26828021367384226.jpg',
        thumbnail: '//img.zmei.me/gm/26828021367384226-thumb.jpg'
      },
      {
        original: '//img.zmei.me/gm/priview.jpg',
        thumbnail: '//img.zmei.me/gm/priview-thumb.jpg'
      },
      {
        original: '//img.zmei.me/gm/lazyimg1.jpg',
        thumbnail: '//img.zmei.me/gm/lazyimg1-thumb.jpg',
      },
      {
        original: '//img.zmei.me/gm/lazyimg2.jpg',
        thumbnail: '//img.zmei.me/gm/lazyimg2-thumb.jpg'
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
  handleCustomToolbarItemClick = (obj) => {
    alert(`当前是第${obj.currentIndex + 1}张图片`)
  }
  render() {
    let gallery = null
    if (this.state.isGallery) {
      gallery = (
        <Gallery
          images={images}
          toolbarConfig={{
            rotateLeft: true,
            rotateRight: true,
            autoPlay: true
          }}
          customToolbarItem={(obj) => {
            return <span onClick={this.handleCustomToolbarItemClick.bind(this, obj)} className='fish-gallery-toolbar-item'  type="question-circle-o">点击显示当前是第几张</span>
          }}
          onClose={this.closeGallery} />
      )
    }
    return (
      <div>
       {gallery}
       <button onClick={this.openGallery}>显示照片</button>
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```

### 设置起始图片

设置从起始图片开始显示。

```jsx
import "rc-gallery/lib/style/";
import Gallery from 'rc-gallery'

const images = [
      {
        original: '//img.zmei.me/gm/a801236bjw1ez812gy3g8j20rs0rs0z5.jpg',
        thumbnail: '//img.zmei.me/gm/a801236bjw1ez812gy3g8j20rs0rs0z5-thumb.jpg',
        description: <div>图片描述</div>
      },
      {
        original: '//img.zmei.me/gm/26828021367384226.jpg',
        thumbnail: '//img.zmei.me/gm/26828021367384226-thumb.jpg'
      },
      {
        original: '//img.zmei.me/gm/priview.jpg',
        thumbnail: '//img.zmei.me/gm/priview-thumb.jpg'
      },
      {
        original: '//img.zmei.me/gm/lazyimg1.jpg',
        thumbnail: '//img.zmei.me/gm/lazyimg1-thumb.jpg',
      },
      {
        original: '//img.zmei.me/gm/lazyimg2.jpg',
        thumbnail: '//img.zmei.me/gm/lazyimg2-thumb.jpg'
      }
    ]

class App extends React.Component {
  state = {
    isGallery: false,
    startIndex: 0
  }
  openGallery = (index) => {
    this.setState({
      isGallery: true,
      startIndex: index
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
          images={images}
          infinite={false}
          startIndex={this.state.startIndex}
          onClose={this.closeGallery} />
      )
    }

    const clickImages = images.map((item, index) => {
      return <img key={index} src={item.thumbnail} className="start-index-thumbnail-item" onClick={() => {this.openGallery(index)}} />
    })

    return (
      <div>
       {gallery}
       {clickImages}
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```

```css
.start-index-thumbnail-item {
  height: 50px;
  width: 100px;
  padding: 0 10px;
}
```

### 只有图片一张的时候

图片只有一张的时候，不显示左右箭头和图片下标,自动播放以及缩略图。

```jsx
import "rc-gallery/lib/style/";
import Gallery from 'rc-gallery'

const images = [
      {
        original: '//img.zmei.me/gm/a801236bjw1ez812gy3g8j20rs0rs0z5.jpg',
        thumbnail: '//img.zmei.me/gm/a801236bjw1ez812gy3g8j20rs0rs0z5-thumb.jpg',
        description: <div>图片描述</div>
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
          images={images}

          onClose={this.closeGallery} />
      )
    }
    return (
      <div>
       {gallery}
       <button onClick={this.openGallery}>显示照片</button>
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```

### 自定义图标

自定义图标。


```jsx
import "rc-gallery/lib/style/";
import Gallery from 'rc-gallery'

const imageOriginal = [
      {
        original: '//img.zmei.me/gm/a801236bjw1ez812gy3g8j20rs0rs0z5.jpg',
        thumbnail: '//img.zmei.me/gm/a801236bjw1ez812gy3g8j20rs0rs0z5-thumb.jpg',
        description: <div>图片描述</div>
      },
      {
        original: '//img.zmei.me/gm/26828021367384226.jpg',
        thumbnail: '//img.zmei.me/gm/26828021367384226-thumb.jpg',
        description: (<div style={{overflowY: 'scroll', maxHeight: '100px'}}>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/>图片描述<br/></div>)
      }
    ]
const images = [...imageOriginal, ...imageOriginal, ...imageOriginal, ...imageOriginal]

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
          images={images}
          closeIcon={'关闭'}
          prevIcon={<span className={'demo-goto-page'}>上一页</span>}
          nextIcon={<span className={'demo-goto-page'}>下一页</span>}
          zoomInIcon={<span style={{color: "#fff"}}>放大 </span>}
          zoomOutIcon={<span style={{color: "#fff"}}>缩小 </span>}
          rotateRightIcon={<span style={{color: "#fff"}}>右转 </span>}
          rotateLeftIcon={<span style={{color: "#fff"}}>左转 </span>}
          playIcon={<span style={{color: "#fff"}}>播放 </span>}
          pauseIcon={<span style={{color: "#fff"}}>暂停 </span>}
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
.demo-goto-page {
  font-size: 15px;
}
```

### 在文档中显示

在文档中显示。


```jsx
import "rc-gallery/lib/style/";
import Gallery from 'rc-gallery'

const images = [
      {
        original: '//img.zmei.me/gm/a801236bjw1ez812gy3g8j20rs0rs0z5.jpg',
        thumbnail: '//img.zmei.me/gm/a801236bjw1ez812gy3g8j20rs0rs0z5-thumb.jpg',
        description: <div>图片描述</div>
      },
      {
        original: '//img.zmei.me/gm/26828021367384226.jpg',
        thumbnail: '//img.zmei.me/gm/26828021367384226-thumb.jpg'
      },
      {
        original: '//img.zmei.me/gm/priview.jpg',
        thumbnail: '//img.zmei.me/gm/priview-thumb.jpg'
      },
      {
        original: '//img.zmei.me/gm/lazyimg1.jpg',
        thumbnail: '//img.zmei.me/gm/lazyimg1-thumb.jpg',
      },
      {
        original: '//img.zmei.me/gm/lazyimg2.jpg',
        thumbnail: '//img.zmei.me/gm/lazyimg2-thumb.jpg'
      }
    ]

class App extends React.Component {
  state = {
    isGallery: true,
  }
  openGallery = (index) => {
    this.setState({
      isGallery: true,
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
        <div style={{height: '400px'}}>
          <Gallery
            images={images}
            infinite={false}
            isFullModal={false}
            onClose={this.closeGallery} />
        </div>
      )
    }

    return (
      <div>
        {gallery}
        {this.state.isGallery ? null : <button onClick={this.openGallery}>查看图片</button>}
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
## API

| 参数        | 说明                                                | 类型        | 默认值 |
|----------- |---------------------------------------------------------  | ---------- |-------|
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
