# SVGAPlayer-for-Live
SVGAPlayer for live, based on SVGAPlayer-Web-Lite

## 安装
```javascript
npm i @gdyfe/svgaplayer-for-live --save
yarn add @gdyfe/svgaplayer-for-live -D
```
## 使用
```typescript
// script
<script src="./dist/SVGAPlayer.min.js"></script> 
// npm
import SVGAPlayer from '@gdyfe/svgaplayer-for-live'
const player = SVGAPlayer({  
    // option 
    target: string | HTMLCanvasElement //* <canvas></canvas> 
    db?: boolean // boolean  是否开启IndexedDB 
    preDown?: number // number 预加载个数 
  },
  { 
    // baseOption 参考 SVGAPlayer-Web-Lite => Player.set({ 参数 })
    loop?: number,   
    cacheFrames?: boolean,
    intersectionObserverRender?: boolean,
    ...
  })
// 插入动画
player.enqueue([ 
  { vaule: //xxx.svga *必有属性  }   
])
player.destroyed({
  events: true, //清除事件需要手动添加，默认不删除  
})
```
## Event
```typescript 
enum EVENT_TYPES {
  START = 'start',  // 开始动画事件回调
  PROCESS = 'process', // 动画播放中事件回调
  PAUSE = 'pause',  // 暂停动画事件回调
  STOP = 'stop',  // 停止动画事件回调
  END = 'end', // 动画结束事件回调
  CLEAR = 'clear' // 清空动画事件回调 
}

SVGAPlayer.$on(item in EVENT_TYPES, (SVGAElementItem: enqueue添加项 中的当前正在播放项) => {})   
SVGAPlayer.$off(item in EVENT_TYPES | 'all')   
```
## 功能
- [x]  队列执行动画
- [x]  IndexedDB 持久化缓存
- [x]  预加载 