/* eslint-disable no-undef */
import Queue from './queue'
import SVAG, { Downloader, EVENT_TYPES, VideoEntity } from 'svga.lite'
import {
  SVGAElementArr,
  SVGAElementItem,
  SVGAoptions,
  SVGAElementSign,
} from './types'
import DB from './db'

class PlayerQueue extends Queue {
  private player: SVAG.Player | null = null
  private parser: SVAG.Parser | null = null
  private downloader: SVAG.Downloader | null = null
  private db: DB | null = null
  private playing = false
  private playedSum = 0
  private options: SVGAoptions = {
    target: '',
    useDB: true,
    preDown: 0,
  }

  public startCallback: ((now: SVGAElementItem) => void) | null = null
  public endCallback: ((now: SVGAElementItem) => void) | null = null
  constructor(options: SVGAoptions) {
    super()
    Object.assign(this.options, options)
    this.init(options?.target)
  }
  /**
   * init 初始化 Player、Parser&Downloader
   * @param element: string | HTMLCanvasElement
   */
  public init(element: string | HTMLCanvasElement): void {
    try {
      this.downloader = new SVAG.Downloader()
      this.player = new SVAG.Player(element)
      this.parser = new SVAG.Parser()
      this.db = new DB()
    } catch (error) {
      console.error(error)
    }
  }
  /**
   * play 队列播放动画
   */
  private async play(): Promise<void> {
    const { player, parser, downloader } = this
    if (!parser || !player || !downloader) return
    // 队列为空时摧毁
    if (this.isEmpty()) {
      this.destroyed()
      return
    }
    let svgaDataInner = null
    let svgaData = null
    // db获取
    if (this.options.useDB && this.db) {
      svgaData = (await this.db.find(
        this.front().value as string
      )) as VideoEntity
    }
    if (!svgaData) {
      // 如果是ArrayBuffer
      if (
        Reflect.toString.call(this.front()?.value) === '[object ArrayBuffer]'
      ) {
        svgaDataInner = this.front().value as ArrayBuffer
      } else {
        this.preDown(this.options.preDown)
        svgaDataInner = await downloader.get(this.front().value as string)
      }
      svgaData = await parser.do(svgaDataInner)
      this.options.useDB &&
        this.db &&
        (await (this.db as any).insert(this.front().value, svgaData))
    }
    player.set({
      loop: 1,
      // 开启后对已绘制的帧进行缓存，提升重复播放动画性能
      cacheFrames: false,
      // 检测动画容器是否处于视窗内，若处于视窗外，停止描绘渲染帧避免造成资源消耗
      intersectionObserverRender: true,
    })
    await player.mount(svgaData)
    player.$on('end' as EVENT_TYPES.END, () => {
      downloader.cancel()
      this.playing = false
      this.endCallback && this.endCallback(this.front())
      this.playedSum++
      this.dequeue()
      this.play()
    })
    player.$on('start' as EVENT_TYPES.START, () => {
      this.playing = true
      this.startCallback && this.startCallback(this.front())
    })
    player.start()
  }
  /**
   * svga 预加载 默认加载后面的1个
   * @param num 预加载个数
   */
  public async preDown(num = 1): Promise<void> {
    const next = this.slice(1, num + 1)
    const lastPlayedSum = this.playedSum
    next.forEach(async (item: SVGAElementItem, index: number) => {
      if (
        Reflect.toString.call(this.queueGet(index + 1).value) !==
        '[object ArrayBuffer]'
      ) {
        const sign = Symbol('')
        this.map.get(this)[index + 1][SVGAElementSign] = sign
        const buffer = await (this.downloader as Downloader).get(
          item.value as string
        )
        const offset = this.playedSum - lastPlayedSum
        if (
          index - offset >= 0 &&
          this.queueGet(index - offset + 1)[SVGAElementSign] === sign
        ) {
          this.queueGet(index - offset + 1).value = buffer
        }
      }
    })
  }
  /**
   * 向队列尾部添加一个（或多个）新的项
   * @param element
   */
  public async enqueue(element: SVGAElementArr): Promise<void> {
    super.baseEnqueue(...element)
    if (!this.playing) {
      this.play()
    }
  }
  /**
   * 摧毁
   */
  public destroyed(): void {
    const { player, parser, downloader } = this
    if (!parser || !player || !downloader) return
    downloader.destroy()
    parser.destroy()
    player.destroy()
  }
}

export default PlayerQueue
