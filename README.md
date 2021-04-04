# SVGAPlayer-for-Live

## 安装
```javascript
npm i @gdyfe/svgaplayer-for-live --save
yarn add @gdyfe/svgaplayer-for-live -D
```
## 使用
```javascript
// script
<script src="./dist/SVGAPlayer.min.js"></script> 
// npm
import websocketHeartbeat from '@gdyfe/svgaplayer-for-live'
new SVGAPlayer({
    // option
    target: string | HTMLCanvasElement 
    db?: boolean // boolean  是否开启IndexedDB 
    preDown?: number // number 预加载个数 
  },
  { 
    // baseOption 参考 SVGAPlayer-Web-Lite => Player.set({ 参数 })
    loop: 1,  
    cacheFrames: false,
    intersectionObserverRender: true,
  })
```
## Event
```javascript
SVGAPlayer 
    // 开始动画事件回调
    .$on('start', (SVGAElementItem: 当前正在播放项) => console.log('event start'))
    // 暂停动画事件回调
    .$on('pause', (SVGAElementItem: 当前正在播放项) => console.log('event pause'))
    // 停止动画事件回调
    .$on('stop', (SVGAElementItem: 当前正在播放项) => console.log('event stop'))
    // 动画结束事件回调
    .$on('end', (SVGAElementItem: 当前正在播放项) => console.log('event end'))
    // 清空动画事件回调
    .$on('clear', (SVGAElementItem: 当前正在播放项) => console.log('event clear')) 
    // 动画播放中事件回调
    .$on('process', (SVGAElementItem: 当前正在播放项) => console.log('event process', player.progress))
```
## 功能
- [x]  队列执行动画
- [x]  IndexedDB 持久化缓存
- [x]  预加载 