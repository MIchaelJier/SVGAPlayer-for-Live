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
  target: string | HTMLCanvasElement 
  db?: boolean // boolean  是否开启IndexedDB 
  preDown?: number // 预加载个数 
  })
```
## HOOK
| 选项名          | 说明 | 参数                 
| :- | :- | :- |
| startCallback | 动画开始回调 | type SVGAElementItem (返回当前播放项)|
| endCallback | 动画结束回调 | / |

## 功能
- [x]  队列执行动画
- [x]  IndexedDB 持久化缓存
- [x]  预加载 