/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-empty-function */
/* eslint-disable no-undef */
import Queue from './queue'
import SVAG, {
  Downloader,
  EVENT_TYPES,
  VideoEntity,
  options as playOptions,
} from 'svga.lite'
import {
  SVGAElementArr,
  SVGAElementItem,
  SVGAoptions,
  SVGAElementSign,
} from './types'
import DB from './db'
import { isArrayBuffer, isVideoEntity, version } from './utils/index'
import Parser1x from 'svga.lite/parser.1x'

class PlayerQueue extends Queue {
  public player: SVAG.Player | null = null
  public parser: SVAG.Parser | null = null
  public parser1x: SVAG.Parser | null = null
  public downloader: SVAG.Downloader | null = null
  private db: DB | null = null
  private playing = false
  private playedSum = 0
  private options: SVGAoptions = {
    target: '',
    useDB: true,
    preDown: 0,
  }
  private baseOptions: playOptions = {
    loop: 1,
    // 开启后对已绘制的帧进行缓存，提升重复播放动画性能
    cacheFrames: false,
    // 检测动画容器是否处于视窗内，若处于视窗外，停止描绘渲染帧避免造成资源消耗
    intersectionObserverRender: true,
  }

  constructor(options: SVGAoptions, baseOptions: playOptions) {
    super()
    Object.assign(this.options, options)
    Object.assign(this.baseOptions, baseOptions)
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
      this.parser1x = new Parser1x()
      this.parser = new SVAG.Parser()
      this.db = new DB()
    } catch (error) {
      console.error(error)
    }
  }

  public $on(
    eventName: EVENT_TYPES,
    execFunction: (element: SVGAElementItem | undefined) => void
  ): PlayerQueue | undefined {
    // this.$onEvent[eventName] = execFunction
    if (!this.player) return
    switch (eventName) {
      case 'start':
        this.player.$on('start' as EVENT_TYPES.START, () => {
          this.playing = true
          execFunction && execFunction(this.front())
        })
        break
      case 'end':
        this.player.$on('end' as EVENT_TYPES.END, () => {
          this.playing = false
          execFunction && execFunction(this.front())
          this.playedSum++
          this.dequeue()
          this.play()
        })
        break
      default:
        this.player.$on(eventName, () => {
          execFunction(this.front())
        })
        break
    }
    return this
  }

  /**
   * play 队列播放动画
   */
  private async play(): Promise<void> {
    const { player, parser, downloader, parser1x } = this
    if (!parser || !player || !downloader || !parser1x) return
    // 队列为空时摧毁
    if (this.isEmpty()) {
      this.destroyed()
      return
    }
    let svgaDataInner = null
    let svgaData = null
    const versionParser = async (data: ArrayBuffer) => {
      const svgaFile =
        version(data) === 1 ? await parser1x.do(data) : await parser.do(data)
      return svgaFile
    }
    // db获取
    if (this.options.useDB && this.db) {
      const dbData = await this.db.find(this.front().value as string)
      if (isArrayBuffer(dbData)) {
        svgaData = await versionParser(dbData)
      } else if (isVideoEntity(dbData)) {
        svgaData = dbData as VideoEntity
      }
    }
    if (!svgaData) {
      // 如果是ArrayBuffer
      if (isArrayBuffer(this.front()?.value)) {
        svgaDataInner = this.front().value as ArrayBuffer
        svgaData = await versionParser(svgaDataInner)
      } else if (isVideoEntity(this.front()?.value)) {
        svgaData = this.front()?.value as VideoEntity
      } else {
        const front = this.front().value as string
        this.preDown(this.options.preDown)
        svgaDataInner = await downloader.get(front)
        svgaData = await versionParser(svgaDataInner)
        await this.insertDB(front, svgaData)
      }
    }
    player.set(this.baseOptions)
    await player.mount(svgaData)
    player.start()
  }
  /**
   * 插入IndexedDB
   * @param key 插入的key
   * @param data 插入的值
   */
  private async insertDB(key: string, data: VideoEntity | ArrayBuffer) {
    if (this.options.useDB && this.db) {
      const result = await (this.db as any).insert(key, data)
      return result
    }
    return
  }
  /**
   * svga 预加载 默认加载后面的1个
   * @param num 预加载个数
   */
  private async preDown(num = 1): Promise<void> {
    const next = this.slice(1, num + 1)
    const lastPlayedSum = this.playedSum
    next.forEach(async (item: SVGAElementItem, index: number) => {
      if (
        !isArrayBuffer(this.queueGet(index + 1).value) &&
        !isVideoEntity(this.queueGet(index + 1).value)
      ) {
        const sign = Symbol('')
        const value = item.value as string
        this.map.get(this)[index + 1][SVGAElementSign] = sign
        const buffer = await (this.downloader as Downloader).get(value)
        await this.insertDB(value, buffer)
        // const result = await (this.parser as SVAG.Parser).do(buffer)
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
    const { player, parser, downloader, parser1x } = this
    if (!parser || !player || !downloader || !parser1x) return
    downloader.destroy()
    parser.destroy()
    player.destroy()
    parser1x.destroy()
    this.playing = false
    this.playedSum = 0
  }
}

export default (
  options: SVGAoptions,
  baseOptions: playOptions
): PlayerQueue => {
  const queue = new PlayerQueue(options, baseOptions)
  return queue
}
