/* eslint-disable no-undef */
import Queue from './queue'
import SVAG, { EVENT_TYPES, VideoEntity } from 'svga.lite'
import { SVAGElementArr, SVAGElementItem } from './types'
import DB from './db'

class PlayerQueue extends Queue {
  // eslint-disable-next-line no-useless-constructor
  player: SVAG.Player | null = null
  parser: SVAG.Parser | null = null
  downloader: SVAG.Downloader | null = null
  db: DB | null = null
  playing = false

  startCallback: ((now: SVAGElementItem) => void) | null = null
  endCallback: ((now: SVAGElementItem) => void) | null = null
  /**
   * @param element: string | HTMLCanvasElement
   */
  constructor(element: string | HTMLCanvasElement) {
    super()
    this.init(element)
  }
  init(element: string | HTMLCanvasElement): void {
    try {
      this.downloader = new SVAG.Downloader()
      this.player = new SVAG.Player(element)
      this.parser = new SVAG.Parser()
      this.db = new DB()
    } catch (error) {
      console.error(error)
    }
  }
  // async autoDownload(): Promise<void> {
  //   if (!this.downloader) return
  //   const q = this.map.get(this)
  //   const old = q[1]
  //   if (q[1]?.value?.toString() === '[object ArrayBuffer]') return
  //   const fileData = await this.downloader.get(this.front().value as string)
  //   console.log(fileData)
  //   if (q[1] === old) {
  //     const a = old.value
  //     old.value = fileData
  //     old.oldvalue = a
  //   }
  //   console.log(q[1])
  // }
  async play(): Promise<void> {
    const { player, parser, downloader } = this
    if (!parser || !player || !downloader) return
    if (this.isEmpty()) {
      this.destroyed()
      return
    }
    let svgaDataInner = null
    let svgaData = null
    // 生成svga data
    if (this.db) {
      svgaData = (await this.db.find(
        this.front().value as string
      )) as VideoEntity
    }
    if (!svgaData) {
      if (this.front()?.value?.toString() === '[object ArrayBuffer]') {
        svgaDataInner = this.front().value as ArrayBuffer
      } else {
        const svgaArr = await Promise.all([
          downloader.get(this.front().value as string),
        ])
        svgaDataInner = svgaArr[0]
      }
      svgaData = await parser.do(svgaDataInner)
      this.db && (await (this.db as any).insert(this.front().value, svgaData))
    }
    player.set({
      loop: 1,
      cacheFrames: false, // 开启后对已绘制的帧进行缓存，提升重复播放动画性能
      intersectionObserverRender: true, // 检测动画容器是否处于视窗内，若处于视窗外，停止描绘渲染帧避免造成资源消耗
    })
    await player.mount(svgaData)
    player.$on('end' as EVENT_TYPES.END, () => {
      downloader.cancel()
      this.playing = false
      this.endCallback && this.endCallback(this.front())
      this.dequeue()
      this.play()
    })
    player.$on('start' as EVENT_TYPES.START, () => {
      this.playing = true
      this.startCallback && this.startCallback(this.front())
    })
    player.start()
  }
  async enqueue(element: SVAGElementArr): Promise<void> {
    super.baseEnqueue(...element)
    if (!this.playing) {
      this.play()
    }
  }
  destroyed(): void {
    const { player, parser, downloader } = this
    if (!parser || !player || !downloader) return
    downloader.destroy()
    parser.destroy()
    player.destroy()
  }
}

export default PlayerQueue
