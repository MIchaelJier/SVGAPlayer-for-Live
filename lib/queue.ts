class Queue {
  map = new WeakMap()

  constructor() {
    this.map.set(this, [])
  }
  /**
   * 向队列尾部添加一个（或多个）新的项
   * @param element
   */
  enqueue(...element: any[]): void {
    const q = this.map.get(this)
    q.push(...element)
  }
  /**
   * 移除队列的第一个（排在队列最前面的）项，并返回被移除的元素
   */
  dequeue(): any {
    const q = this.map.get(this)
    const r = q.shift()
    return r
  }
  /**
   * 返回队列中第一个元素——最先被添加，也将是最先被移除的元素。队列不做任何变动（不移除元素，只返回元素信息）
   */
  front(): any {
    const q = this.map.get(this)
    return q[0]
  }
  /**
   * 如果队列中不包含任何元素，返回true，否则返回false
   */
  isEmpty(): boolean {
    return this.map.get(this).length === 0
  }
  /**
   * 返回队列包含的元素个数
   */
  size(): number {
    const q = this.map.get(this)
    return q.length
  }
  /**
   * 清空队列里面的元素
   */
  clear(): void {
    this.map.set(this, [])
  }
  /**
   * 打印队列为String到控制台
   */
  print(): void {
    console.log(this.toString())
  }
  /**
   * 输出队列以String模式
   */
  toString(): string {
    return this.map.get(this).toString()
  }
}

export default Queue
