### 概述

运用danmu.js可以方便地使用弹幕功能，满足任意Web DOM元素使用（包括video）。弹幕实现了顶部居中、底部居中、彩色弹幕、无遮挡滚动（具体算法参考[前端算法之弹幕设计](https://segmentfault.com/a/1190000015722802)），以及其它常用的弹幕使用方式。


### 起步

1. 安装

    ```
    $ npm install danmu.js
    ```

2. 使用

- Step 1:

    ```html
    <div id="vs"></div>
    <video id="mse" controls>
      <source src="demo.mp4" type="video/mp4">
    </video>
    ```

- Step 2:

    ```js
    import DanmuJs from 'danmu.js'

    let danmujs = new DanmuJs({
      container: document.getElementById('vs'), //弹幕容器，该容器发生尺寸变化时会自动调整弹幕行为
      containerStyle: { //弹幕容器样式
        zIndex: 100
      },
      player: document.getElementsByTagName('video')[0], //配合音视频元素（video或audio）同步使用时需提供该项
      comments: [ //弹幕预存数组,配合音视频元素（video或audio）同步使用时需提供该项
        {
          duration: 20000, //弹幕持续显示时间,毫秒(最低为5000毫秒)
          //moveV: 100, //弹幕匀速移动速度(单位: px/秒)，设置该项时duration无效
          id: '1', //弹幕id，需唯一
          start: 2000, //弹幕出现时间（毫秒）
          prior: true, //该条弹幕优先显示，默认false
          color: true, //该条弹幕为彩色弹幕，默认false
          txt: '长弹幕长弹幕长弹幕长弹幕长弹幕', //弹幕文字内容
          style: {  //弹幕自定义样式
            color: '#ff9500',
            fontSize: '20px',
            padding: '2px 11px',
          },
          mode: 'top', //显示模式，top顶部居中，bottom底部居中，scroll滚动，默认为scroll
          like: { // 点赞相关参数
            el: likeDOM, // el 仅支持传入 dom 
            style: { // el 绑定样式
              paddingLeft: '10px',
              color: '#ff0000'
            }
          }
          // el: DOM //直接传入一个自定义的DOM元素作为弹幕，使用该项的话会忽略所提供的txt和style
        }
      ],
      area: {  //弹幕显示区域
        start: 0, //区域顶部到播放器顶部所占播放器高度的比例
        end: 1 //区域底部到播放器顶部所占播放器高度的比例
      },
      channelSize: 40, // 轨道大小
      mouseControl: true, // 打开鼠标控制, 打开后可监听到 bullet_hover 事件。danmu.on('bullet_hover', function (data) {})
      mouseControlPause: false, // 鼠标触摸暂停。mouseControl: true 生效
      //bOffset: 1000, //可调节弹幕横向间隔（毫秒）
      defaultOff: true //开启此项后弹幕不会初始化，默认初始化弹幕
    })
    ```

这是danmu.js的npm使用方法，cdn使用可以参考示例。[DEMO](https://github.com/bytedance/danmu.js/tree/master/demo/index.html)

### API

弹幕控制相关API

```js
player.danmu.start() //弹幕初始化并播放(内部默认已调用)
player.danmu.pause() //弹幕暂停
player.danmu.play() //弹幕继续播放
player.danmu.stop() //弹幕停止并消失
player.danmu.sendComment({  //发送弹幕
    duration: 15000,
    id: 'id',
    start: 3000, //不提供该项则立即发送
    txt: '弹幕内容',
    style: {
        color: '#ff9500',
        fontSize: '20px',
        border: 'solid 1px #ff9500',
        borderRadius: '50px',
        padding: '5px 11px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }
})
player.danmu.setCommentDuration(id, duration) //按照id改变某一个弹幕的持续显示时间
player.danmu.setAllDuration(mode, duration) //改变所有已加入队列弹幕的持续显示时间
player.danmu.setCommentID(oldID, newID) //改变某一个弹幕的id
player.danmu.hide(mode) //屏蔽某一类弹幕(参数可选值 scroll | top | bottom | color)
player.danmu.show(mode) //显示某一类弹幕(参数可选值 scroll | top | bottom | color)
player.danmu.setArea(area) // 修改弹幕显示区域
player.danmu.setOpacity(opacity) // 设置透明度
player.danmu.setFontSize(size, channelSize) // 设置样式 size 为字体大小 channelSize 如果不需要修改轨道大小则无需传入 channelSize
danmu.setCommentLike(id, {
    el: likeDOM,
    style: {
        paddingLeft: '10px',
        color: '#ff0000'
    }
}) // 这是点赞样式，id 为 commentid
```

### Dev

我们为开发者提供了示例，使用方式如下：

```
$ git clone git@github.com:bytedance/danmu.js.git
$ cd danmu.js
$ npm install
$ npm run build
$ http-server
```

访问 [http://localhost:8080/demo/index.html](http://localhost:8080/demo/index.html)


### License

[MIT](http://opensource.org/licenses/MIT)
