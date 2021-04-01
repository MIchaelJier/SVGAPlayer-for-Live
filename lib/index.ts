/* eslint-disable no-undef */
import Queue from './queue'
import SVGA, { Player, Parser } from 'svgaplayerweb'

class PlayerQueue extends Queue {
  // eslint-disable-next-line no-useless-constructor
  player: Player | null = null
  parser: Parser | null = null
  playing = false
  /**
   * @param element
   */
  constructor(element: string | HTMLCanvasElement | HTMLDivElement) {
    super()
    this.init(element)
  }
  init(element: string | HTMLCanvasElement | HTMLDivElement): void {
    this.player = new SVGA.Player(element)
    this.parser = new SVGA.Parser() // 支持 IE6+
  }
  play(): void {
    if (!this.parser || !this.player) return
    if (this.isEmpty()) return
    console.log(this.front())
    this.parser.load(this.front(), (videoItem) => {
      this.playing = true
      if (!this.player) return
      this.player.loops = 1
      this.player.setVideoItem(videoItem)
      this.player.startAnimation()
      this.player.onFinished(() => {
        this.dequeue()
        this.playing = false
        this.play()
      })
    })
  }
  enqueue(element: any[]): void {
    super.enqueue(...element)
    !this.playing && this.play()
  }
}

export default PlayerQueue
