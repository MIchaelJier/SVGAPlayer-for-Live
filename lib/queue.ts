import { SVGAElementArr, SVGAElementItem } from './types'

class Queue {
  public map = new WeakMap()

  constructor() {
    this.map.set(this, [])
  }
  /**
   * 向队列尾部添加一个（或多个）新的项
   * @param element
   */
  public baseEnqueue(...element: SVGAElementArr): void {
    const q = this.map.get(this)
    q.push(...element)
  }
  /**
   * 移除队列的第一个（排在队列最前面的）项，并返回被移除的元素
   */
  public dequeue(): SVGAElementItem {
    const q = this.map.get(this)
    const r = q.shift()
    return r
  }
  /**
   * 获取截取队列
   */
  public slice(start = 0, end?: number): SVGAElementItem {
    const q = this.map.get(this)
    return q.slice(start, end)
  }
  /**
   * 返回队列中的某个值
   */
  public queueGet(key: number): SVGAElementItem {
    const q = this.map.get(this)
    return q[key]
  }
  /**
   * 替换队列中的某个值
   */
  public queueReplace(key: number, item: SVGAElementItem): void {
    const q = this.map.get(this)
    q[key] = item
  }
  /**
   * 返回队列中第一个元素——最先被添加，也将是最先被移除的元素。队列不做任何变动（不移除元素，只返回元素信息）
   */
  public front(): SVGAElementItem {
    const q = this.map.get(this)
    return q[0]
  }
  /**
   * 如果队列中不包含任何元素，返回true，否则返回false
   */
  public isEmpty(): boolean {
    return this.map.get(this).length === 0
  }
  /**
   * 返回队列包含的元素个数
   */
  public size(): number {
    const q = this.map.get(this)
    return q.length
  }
  /**
   * 清空队列里面的元素
   */
  public clear(): void {
    this.map.set(this, [])
  }
  /**
   * 打印队列为String到控制台
   */
  public print(): void {
    console.log(this.toString())
  }
  /**
   * 输出队列以String模式
   */
  public toString(): string {
    return this.map.get(this).toString()
  }
}

export default Queue
