import { VideoEntity } from 'svga.lite'

export type SVAGElementItem = {
  value: string | VideoEntity | ArrayBuffer
  id?: number
  [propName: string]: any
}

export type SVAGElementArr = Array<SVAGElementItem>
